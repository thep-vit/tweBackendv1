# The Weekly Edge Application

This repository is for development of TWE Web Application for The Hindu Education Plus Club. 

## Flow

Progress tested with basic ui for now

![PROGRESS](./images/backendProgress2.png)

## Progress

1. Routes for basic user operations set up - Login, Register, Signup, Update, Delete, logout, logout everywhere, forgot password.
2. Routes for handling articles set up - create, update, list by id, list all, delete
3. basic frontend with hbs dynamic rendering
4. validation using validator during db storage
5. auth middleware - checks for jwt token during login/signup and stored browser cookie.
6. picture upload for each article

## API Routes - For Frontend Developers

Request Body or Request Query or Request Params are Null unless stated otherwise

All Responses are in Status Codes and JSON

### User Routes: *api/users/*

1. Create User - POST *api/users/signup*
   1. Request Body: JSON with name,email,password,department
   2. On Success: 200, {created User,token}
   3. On failiure: 400


2. Login User - POST *api/users/login*
   1. Request Body: email,password
   2. On Success: 200, {user,token}
   3. On post failure: 400


3. Logout User - POST *api/users/logout* & Logout from everywhere *api/users/logoutAll*
   1. On success: 200
   2. Request Header - "Authorization" - with Bearer token recieved (referred from here on as **AUTH HEADER**)
   3. Auth Failiure: 401
   4. On post Failiure: 500

4. Get Dashboard *api/users/dashboard*, Login *api/users/login*, Signup *api/users/signup*
   1. Give back 200 - Render from react

5. Update User - PATCH *api/users/me*
   1. Request Body: JSON with keys as valid fields that can be changed (name, email,password,age,department)
   2. Auth Header - 401 on Failiure
   3. On Success: 200, updated user
   4. On Failiure (patch or invalid update): 400

6. Delete User - DELETE *api/users/me*
   1. Auth Header - 401 on Failiure
   2. On Success: 200
   3. On delete Failiure: 500

### Article Routes: *api/articles/*

1. Create Article - POST *api/articles*
   1. Request Body: JSON with atype,atitle,acontent,picture(picture is *type: file*)
   2. Auth Header (Here checks author also - only author can see their articles)
   3. On success: 200, created article
   4. On post Failiure: 500

2. Get Picture - GET */articles/:id/picture*
   1. Request Param: ID of the picture
   2. Auth header
   3. On success: 200, picture as png
   4. On failiure: 404

3. List all articles by the user - GET */articles/list*
   1. Request Query:
      1. No Query - List all articles by default order
      2. *GET /articles/list?limit=2&skip=2* for Pagination - eg: if 4 articles are present: lists 2 after skipping first 2
      3. *GET /articles/list?sortBy=createdAt:asc* - lists articles sorted by any feature - here by **createdAt**
      4. On Success: 200, list of articles

4. List article by ID - GET */articles/:id*
   1. Request Params: Article ID
   2. On Success: 200, article
   3. On Failiure: 400

5. Update article by ID - PATCH */articles/:id*
   1. Request Param: Article ID
   2. Request Body: JSON with key value pairs to be updated 
   3. On Success:200, updated article
   4. On patch failiure: 400
   5. On invalid ID: 404

6. Delete Article By ID - DELETE */articles/:id*
   1. Request Param: Article ID
   2. On Success:200, deleted article
   3. On patch failiure: 400
   4. On invalid ID: 404
   

&copy;
Copyright of The Hindu Education Plus Club VIT Vellore