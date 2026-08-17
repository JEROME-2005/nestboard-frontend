import { useEffect, useState } from "react"
import { Loader2, Save, User } from "lucide-react"

import { getCurrentUser, updateProfile } from "@/api/auth"
import { useAuthStore } from "@/stores/authStore"

export function Profile() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bioTag, setBioTag] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "")
      setAvatarUrl(user.avatarUrl ?? "")
      setBioTag(user.bioTag ?? "")
    }
  }, [user])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const updatedUser = await updateProfile({
        displayName,
        avatarUrl,
        bioTag,
      })

      setUser(updatedUser)

      setMessage("Profile updated successfully.")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile."
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshProfile() {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setError("Unable to refresh profile.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-28 pb-10">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                My Profile
              </h1>

              <p className="text-sm text-gray-500">
                Update your NestBoard profile.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="flex justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl font-bold">
                  {displayName
                    ?.charAt(0)
                    ?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Display Name
              </label>

              <input
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Profile Image URL
              </label>

              <input
                value={avatarUrl}
                onChange={(event) =>
                  setAvatarUrl(event.target.value)
                }
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Bio
              </label>

              <textarea
                value={bioTag}
                onChange={(event) =>
                  setBioTag(event.target.value)
                }
                className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2.5"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              <Save className="h-4 w-4" />

              {isLoading
                ? "Saving..."
                : "Save Profile"}
            </button>
          </form>

          <button
            type="button"
            onClick={refreshProfile}
            className="mt-4 w-full rounded-lg border px-4 py-2 text-sm"
          >
            Refresh Profile
          </button>
        </div>
      </div>
    </div>
  )
}