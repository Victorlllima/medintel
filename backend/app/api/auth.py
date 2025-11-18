"""
Authentication endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import get_supabase
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
    Token,
    TokenData
)

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    supabase = get_supabase()

    # Check if user already exists
    existing = supabase.table("users").select("*").eq("email", user_data.email).execute()

    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user in Supabase Auth
    try:
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

    # Create user profile
    user_profile = {
        "id": auth_response.user.id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "crm": user_data.crm,
        "specialty": user_data.specialty,
    }

    result = supabase.table("users").insert(user_profile).execute()

    # Create access token
    access_token = create_access_token(data={"sub": auth_response.user.id})

    return Token(
        access_token=access_token,
        user=UserResponse(**result.data[0])
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with email and password"""
    supabase = get_supabase()

    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username,  # OAuth2 uses 'username' field
            "password": form_data.password,
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Get user profile
    user = supabase.table("users").select("*").eq("id", auth_response.user.id).execute()

    if not user.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )

    # Create access token
    access_token = create_access_token(data={"sub": auth_response.user.id})

    return Token(
        access_token=access_token,
        user=UserResponse(**user.data[0])
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: TokenData = Depends(get_current_user)):
    """Get current user profile"""
    supabase = get_supabase()

    user = supabase.table("users").select("*").eq("id", current_user.user_id).execute()

    if not user.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(**user.data[0])


@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update current user profile"""
    supabase = get_supabase()

    # Only update fields that are provided
    update_data = user_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )

    result = supabase.table("users").update(update_data).eq("id", current_user.user_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(**result.data[0])


@router.post("/forgot-password")
async def forgot_password(email: str):
    """Send password reset email"""
    supabase = get_supabase()

    try:
        supabase.auth.reset_password_for_email(email)
    except Exception as e:
        # Don't reveal if email exists or not
        pass

    return {"message": "If the email exists, a password reset link has been sent"}
