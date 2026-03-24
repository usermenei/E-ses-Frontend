import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import SignOutButton from "./SignOutButton";

export default async function TopMenu() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <style>{`
        .topmenu {
          height: 52px;
          background: #fff;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 8px;
          font-family: 'Nunito', sans-serif;
        }
        .topmenu-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 16px;
          flex-shrink: 0;
        }
        .topmenu-logo-circle {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #0891b2;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 11px;
        }
        .topmenu-logo-text {
          font-weight: 800; color: #0891b2;
          letter-spacing: 0.5px; font-size: 14px;
        }
        .topmenu-navlinks {
          display: flex; align-items: center; gap: 4px; flex: 1;
        }
        .topmenu-navlink {
          text-decoration: none;
          font-size: 13px; color: #555;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.15s, color 0.15s;
        }
        .topmenu-navlink:hover { background: #f0f9ff; color: #0891b2; }
        .topmenu-right {
          display: flex; align-items: center;
          gap: 10px; margin-left: auto;
        }
        .topmenu-user {
          text-decoration: none;
          display: flex; align-items: center; gap: 7px;
        }
        .topmenu-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #0891b2; color: #fff;
          font-weight: 800; font-size: 11px;
          display: flex; align-items: center; justify-content: center;
        }
        .topmenu-username { font-size: 13px; color: #0891b2; font-weight: 700; }
        .topmenu-signout {
          text-decoration: none; font-size: 12px; color: #9ca3af;
        }
        .topmenu-signin {
          text-decoration: none;
          font-size: 13px; font-weight: 700; color: #0891b2;
          border: 1.5px solid #0891b2;
          padding: 6px 16px; border-radius: 20px;
          transition: background 0.15s, color 0.15s;
        }
        .topmenu-signin:hover { background: #0891b2; color: #fff; }
      `}</style>

      <nav className="topmenu">
        <Link href="/" className="topmenu-logo">
          <div className="topmenu-logo-circle">CS</div>
          <span className="topmenu-logo-text">CoSpace</span>
        </Link>

        <div className="topmenu-navlinks">
          <Link href="/workspace" className="topmenu-navlink">Spaces</Link>
          <Link href="/booking" className="topmenu-navlink">Booking</Link>
          <Link href="/mybooking" className="topmenu-navlink">My Booking</Link>
        </div>

        <div className="topmenu-right">
          {session ? (
            <>
              <Link href="/profile" className="topmenu-user">
                <div className="topmenu-avatar">
                  {session.user?.name?.slice(0, 2).toUpperCase()}
                </div>
                <span className="topmenu-username">{session.user?.name}</span>
              </Link>
              
              {/* ✅ แทนที่ Link เดิมด้วย SignOutButton */}
              <SignOutButton />
            </>
          ) : (
            <Link href="/api/auth/signin" className="topmenu-signin">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}