from fastapi import FastAPI, HTTPException, Path, Query
from typing import List, Optional
from pydantic import BaseModel
import requests


class User(BaseModel):
    id: int
    name: str
    username: str
    email: str


app = FastAPI(title="Simple User API")

@app.get('/', tags=["home"])
async def root():
    return {"message": "Welcome to the User API"}

@app.get('/users', response_model=List[User], tags=["users"])
async def get_users(
    limit: Optional[int] = Query(None, description="Limit the number of users")
):
    response = requests.get("https://jsonplaceholder.typicode.com/users")
    
    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch users")
    
    users = response.json()
    
    # Apply limit if specified
    if limit and limit > 0:
        users = users[:limit]
        
    return users

@app.get('/users/{user_id}', response_model=User, tags=["users"])
async def get_user(
    user_id: int = Path(..., description="The ID of the user to retrieve", ge=1)
):
    response = requests.get(f"https://jsonplaceholder.typicode.com/users/{user_id}")
    
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"User with ID {user_id} not found")
    
    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch user")
    
    return response.json()
