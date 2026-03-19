import { expect } from '@playwright/test';
import {test} from '../utils/fixtures';

let authtoken:string;

test.beforeAll(async({api})=>{
    const tokenResponse = await api
        .path("/api/users/login")
        .body({"user": {"email": "fakemail@fake.com", "password": "fakemail1$"}})
        .postRequest(200);
    authtoken = tokenResponse.user.token;
})

test('check condition',async({api})=>{
    const response = await api
    .url("https://conduit-api.bondaracademy.com/")
    .path("api/articles/")
    .headers({Authorization:"test"}) 
      
});

test('Get Articles',async({api})=>{
    const response = await api
    .path("/api/articles")
    .params({limit:5, offset:0})
    .getRequest(200);   

    expect(response.articles.length).toBeLessThanOrEqual(10);
    expect(response.articlesCount).toEqual(10);
});

test('Get test tags',async({api})=>{
    const response = await api
    .path("/api/tags")
    .getRequest(200);
    expect(response.tags[0]).toEqual('Test');
    expect(response.tags.length).toBeLessThanOrEqual(10);
})

test('Create and delete Article', async({api})=>{
    const createArticleResponse = await api
        .path('/api/articles')
        .headers({ Authorization: `Token ${authtoken}` })
        .body({ "article": { "title": "Hello World1", "description": "Hello World", "body": "HELLO", "tagList": [] } })
        .postRequest(201)
    expect(createArticleResponse.article.title).toEqual('Hello World1')
    const slugId = createArticleResponse.article.slug;

    const articlesResponse = await api
        .path('/api/articles')
        .headers({ Authorization: `Token ${authtoken}` })
        .params({ limit: 10, offset: 0 })
        .getRequest(200)    
    expect(articlesResponse.articles[0].title).toEqual('Hello World1')

    await api
        .path(`/api/articles/${slugId}`)
        .headers({ Authorization: `Token ${authtoken}` })
        .deleteRequest(204)

    const articlesResponseAD = await api
        .path('/api/articles')
        .headers({ Authorization: `Token ${authtoken}` })
        .params({ limit: 10, offset: 0 })
        .getRequest(200)    
    expect(articlesResponseAD.articles[0].title).not.toEqual('Hello World1')
});

test('Create Update and delete Article', async({api})=>{
    const createArticleResponse = await api
        .path('/api/articles')
        .headers({ Authorization: `Token ${authtoken}` })
        .body({ "article": { "title": "Hello World101", "description": "Hello World", "body": "HELLO", "tagList": [] } })
        .postRequest(201)
    expect(createArticleResponse.article.title).toEqual('Hello World101')
    const slugId = createArticleResponse.article.slug;

    const updateArticleResponse = await api
        .path(`/api/articles/${slugId}`)
        .headers({ Authorization: `Token ${authtoken}` })
        .body({ "article": { "title": "Updated Title", "description": "Updated Description", "body": "Updated Body", "tagList": [] } })
        .putRequest(200)
    expect(updateArticleResponse.article.title).toEqual('Updated Title')
    const newslugId = updateArticleResponse.article.slug;

    const articlesResponse = await api
        .path('/api/articles')
        .headers({ Authorization: `Token ${authtoken}` })
        .params({ limit: 10, offset: 0 })
        .getRequest(200)    
    expect(articlesResponse.articles[0].title).toEqual('Updated Title')

    await api
        .path(`/api/articles/${newslugId}`)
        .headers({ Authorization: `Token ${authtoken}` })
        .deleteRequest(204)

    const articlesResponseAD = await api
        .path('/api/articles')
        .headers({ Authorization: `Token ${authtoken}` })
        .params({ limit: 10, offset: 0 })
        .getRequest(200)    
    expect(articlesResponseAD.articles[0].title).not.toEqual('Updated Title')
});