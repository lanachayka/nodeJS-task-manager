const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app');
const { userOne, setupDatabase, userTwo, taskOne, taskTwo, taskThree } = require('./fixtures/db')

beforeEach(() => setupDatabase());

test('should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Test task'
        })
        .expect(201);
    
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();

    expect(task.completed).toBeFalsy();
});

test('should not create task without description', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({})
        .expect(400);
});

test('should response all tasks for user one', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(201);
    
    expect(response.body.length).toBe(2);
});

test('should delete user task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200);

    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
});

test('should not delete other useres tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(404);

    const task = await Task.findById(taskThree._id);
    expect(task).not.toBeNull();
});

test('should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .expect(404);
});

test('should not update task with invalid property', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: "Boston"
        })
        .expect(400);
});

test('should not update other users task', async () => {
    await request(app)
        .patch(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "New description"
        })
        .expect(404);
    
    const task = await Task.findById(taskThree._id);
    expect(task.description).toBe("Third task");
});

test('should fetch user task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(201);
});

test('should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .expect(404);
});

test('should not fetch other users task by id', async () => {
    await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(404);
});

test('should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(201);
    
    expect(response.body.length).toBe(1);
    expect(response.body[0].completed).toBe(true);
});

test('should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(201);

    expect(response.body.length).toBe(1);
    expect(response.body[0].completed).toBe(false);
});