const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldPasswordBlock = `                    <div>
                      <label className="block text-[13px] font-medium text-[#172B3A] mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                        placeholder="••••••••"
                      />
                    </div>`;

const newPasswordBlock = `                    {!isGoogleAuth && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    )}`;

const oldConfirmBlock = `                    {isRegistering && portal === 'patient' && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    )}`;

const newConfirmBlock = `                    {!isGoogleAuth && isRegistering && portal === 'patient' && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#172B3A] mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-[40px] border border-[#CBD5E1] rounded-[4px] px-3 text-[14px] text-[#172B3A] focus:outline-none focus:border-[#1F5F8B] focus:ring-1 focus:ring-[#1F5F8B] transition-colors"
                          placeholder="••••••••"
                        />
                      </div>
                    )}`;

const oldSubmitBlock = `                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-[44px] bg-[#1F5F8B] text-[#FFFFFF] rounded-[6px] text-[14px] font-medium hover:bg-[#173F5F] transition-colors flex items-center justify-center disabled:opacity-80"
                      >
                        {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? 'Create Account' : 'Sign In')}
                      </button>
                    </div>

                    <div className="pt-3 text-center">
                      <button 
                        type="button" 
                        onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} 
                        className="text-[13px] font-medium text-[#1F5F8B] hover:underline transition-colors"
                      >
                        {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                      </button>
                    </div>`;

const newSubmitBlock = `                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-[44px] bg-[#1F5F8B] text-[#FFFFFF] rounded-[6px] text-[14px] font-medium hover:bg-[#173F5F] transition-colors flex items-center justify-center disabled:opacity-80"
                      >
                        {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegistering ? (isGoogleAuth ? 'Complete Registration' : 'Create Account') : 'Sign In')}
                      </button>
                    </div>

                    {!isGoogleAuth && (
                      <>
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#CBD5E1]"></div>
                          </div>
                          <div className="relative flex justify-center text-[11px]">
                            <span className="bg-[#FFFFFF] px-2 text-[#52606D] font-semibold uppercase tracking-wider">OR</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleGoogleAuth}
                          disabled={authLoading}
                          className="w-full h-[40px] bg-[#FFFFFF] border border-[#CBD5E1] text-[#172B3A] rounded-[4px] text-[13px] font-medium hover:bg-[#F4F6F8] transition-colors flex items-center justify-center gap-2 disabled:opacity-80"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Continue with Google
                        </button>
                      </>
                    )}

                    <div className="pt-3 text-center">
                      <button 
                        type="button" 
                        onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} 
                        className="text-[13px] font-medium text-[#1F5F8B] hover:underline transition-colors"
                      >
                        {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                      </button>
                    </div>`;

let success = true;

if (code.includes(oldPasswordBlock)) {
  code = code.replace(oldPasswordBlock, newPasswordBlock);
  console.log("Patched oldPasswordBlock");
} else {
  console.log("oldPasswordBlock not found");
  success = false;
}

if (code.includes(oldConfirmBlock)) {
  code = code.replace(oldConfirmBlock, newConfirmBlock);
  console.log("Patched oldConfirmBlock");
} else {
  console.log("oldConfirmBlock not found");
  success = false;
}

if (code.includes(oldSubmitBlock)) {
  code = code.replace(oldSubmitBlock, newSubmitBlock);
  console.log("Patched oldSubmitBlock");
} else {
  console.log("oldSubmitBlock not found");
  success = false;
}

if (success) {
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully patched form ui in App.tsx!");
} else {
  console.error("Failed to patch some blocks");
}

