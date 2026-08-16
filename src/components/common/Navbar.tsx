import {
  Heart,
  Building2,
  MessageCircle,
  LogOut,
  CalendarCheck,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router"
import { useAuthStore } from "@/stores/authStore"

export type NavbarLink = {
  label: string
  to: string
}

type NavbarProps = {
  links: NavbarLink[]
}

export function Navbar({ links }: NavbarProps) {
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const isSignedIn = !!user
  const isAdmin = user?.role === "ADMIN"

  function handleLogout() {
    logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="absolute top-0 right-0 left-0 z-50 px-4 pt-4">
      <nav
        className={`flex items-center justify-between rounded-full px-5 py-3 ${
          isAdmin ? "bg-blue-500/50" : "bg-orange-500/50"
        }`}
      >
        {/* Logo */}
        <NavLink to="/">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>

            <span className="text-lg tracking-wide text-white">
              NestBoard
            </span>
          </div>
        </NavLink>

        {/* Main Navigation */}
        <div className="flex items-center gap-1">
          {links.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "text-md rounded-full px-4 py-1.5 transition-all duration-200",
                  isActive
                    ? "bg-primary text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? "text-md rounded-full bg-primary px-4 py-1.5 text-white"
                  : "text-md px-4 py-1.5 text-white/70 hover:text-white"
              }
            >
              Admin
            </NavLink>
          )}
        </div>

        {/* Authenticated Actions */}
        <div className="flex items-center gap-3.5">
          {isSignedIn && (
            <>
              <NavLink
                to="/bookings"
                className="rounded-full p-2"
                title="My Bookings"
              >
                <CalendarCheck className="h-5 w-5 text-white/70 hover:text-white" />
              </NavLink>

              <NavLink
                to="/saved"
                className="rounded-full p-2"
                title="Saved Properties"
              >
                <Heart className="h-5 w-5 text-white/70 hover:text-white" />
              </NavLink>

              <button
                type="button"
                className="rounded-full p-2"
                title="Messages"
              >
                <MessageCircle className="h-5 w-5 text-white/70 hover:text-white" />
              </button>

              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-700">
                    {user.displayName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </div>
  )
}