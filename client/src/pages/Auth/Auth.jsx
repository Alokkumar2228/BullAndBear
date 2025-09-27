import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { signup_logo } from '../../assets';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  const handleLogout = async () => {
    await signOut();
    console.log("User logged out!");
  }

  return (
    <div className="auth-container">
      {/* Main Content */}
      <main className="auth-main">
        <div className="container">
          <div className="auth-wrapper">
            
            {/* Left Side - Features */}
            <div className="features-section">
              <img src={signup_logo} alt="Bull&Bear Logo" />           
            </div>

            {/* Right Side - Authentication */}
            <div className="form-section">
              <div className="form-container">
                
                {/* Show when user is signed out */}
                <SignedOut>
                  <div className="form-header">
                    <h2 className="form-title">
                      Welcome to Bull&Bear
                    </h2>
                    <p className="form-subtitle">
                      Join India's largest stock broker in 2 minutes
                    </p>
                  </div>

                  <div className="clerk-auth-buttons">
                    <SignUpButton 
                      mode="modal"
                      redirectUrl="/dashboard"
                      afterSignUpUrl="/dashboard"   
                    >
                      <button className="submit-btn primary">
                        Create Account
                        <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </SignUpButton>

                    <div className="form-footer">
                      <div className="toggle-section">
                        <p className="toggle-text">
                          Already have an account?
                        </p>
                        <SignInButton 
                          mode="modal"
                          redirectUrl="/dashboard"
                          afterSignInUrl="/dashboard"
                        >
                          <button className="toggle-btn">
                            Sign In
                          </button>
                        </SignInButton>
                      </div>
                    </div>

                    {/* Terms and Privacy */}
                    <p className="terms-text">
                      By creating an account, you agree to our{' '}
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </SignedOut>

                {/* Show when user is signed in - This will rarely be seen due to useEffect redirect */}
                <SignedIn>
                  <div className="form-header">
                    <h2 className="form-title">
                      Redirecting...
                    </h2>
                    <p className="form-subtitle">
                      Taking you to your dashboard
                    </p>
                  </div>

                  <div className="signed-in-section">
                    <UserButton 
                      afterSignOutUrl="/auth"
                      appearance={{
                        elements: {
                          avatarBox: "w-12 h-12",
                          userButtonPopoverCard: "bg-white shadow-lg",
                          userButtonPopoverActionButton: "hover:bg-gray-50"
                        }
                      }}
                    />
                  </div>
                </SignedIn>

                <button onClick={handleLogout} style={{ display: 'none' }}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-footer">
        <div className="container">
          <p className="footer-text">
            © 2024 Bull&Bear Broking Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Auth;