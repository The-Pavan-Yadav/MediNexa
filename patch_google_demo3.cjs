const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldSignout = `        } catch (dbError: any) {
          console.error("Database operation failed during registration, rolling back Auth user...", dbError);
          if (!isGoogleAuth && auth.currentUser) {
            await auth.currentUser.delete();
          }
          throw dbError;
        }`;

const newSignout = `        } catch (dbError: any) {
          console.error("Database operation failed during registration, rolling back Auth user...", dbError);
          if (!isGoogleAuth && auth.currentUser) {
            try { await auth.currentUser.delete(); } catch(e) {}
          }
          throw dbError;
        }`;

code = code.replace(oldSignout, newSignout);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched signout error handling");
