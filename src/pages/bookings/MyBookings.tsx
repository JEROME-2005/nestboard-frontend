import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  XCircle,
} from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { useMyBookings } from "@/hooks/useBookings"
import { useCancelBooking } from "@/hooks/useBookings"
import type { BookingStatus } from "@/api/bookings"
import { ApiError } from "@/api/client"
import { useState } from "react"

function statusClasses(status: BookingStatus) {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-50 text-green-700 border-green-200"

    case "PENDING":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200"

    case "EXPIRED":
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

function StatusIcon({
  status,
}: {
  status: BookingStatus
}) {
  if (status === "CONFIRMED") {
    return <CheckCircle2 className="size-4" />
  }

  if (status === "PENDING") {
    return <Clock3 className="size-4" />
  }

  return <XCircle className="size-4" />
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export function MyBookings() {
  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useMyBookings()

  const cancelMutation = useCancelBooking()

  const [error, setError] = useState("")

  function handleCancel(id: string) {
    setError("")

    cancelMutation.mutate(id, {
      onError: (err) => {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError(
            "Unable to cancel this booking."
          )
        }
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-16 pt-28">
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Bookings
          </h1>

          <p className="mt-2 text-gray-500">
            View and manage your NestBoard
            reservations.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Loading bookings...
            </p>
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-700">
              Could not load your bookings.
            </p>

            <Button
              className="mt-4"
              variant="outline"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          bookings.length === 0 && (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <Home className="mx-auto size-10 text-gray-300" />

              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No bookings yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Explore properties and reserve
                your first seat.
              </p>

              <Button
                asChild
                className="mt-5"
              >
                <Link to="/">
                  Explore properties
                </Link>
              </Button>
            </div>
          )}

        <div className="mt-8 space-y-5">
          {bookings.map((booking) => {
            const property =
              booking.room.roomType.property

            const price = Number(
              booking.totalAmount
            )

            return (
              <div
                key={booking.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex flex-col md:flex-row">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="h-52 w-full object-cover md:h-auto md:w-56"
                  />

                  <div className="flex-1 p-5 md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {property.title}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {property.address},{" "}
                          {property.city}
                        </p>
                      </div>

                      <span
                        className={[
                          "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                          statusClasses(
                            booking.bookingStatus
                          ),
                        ].join(" ")}
                      >
                        <StatusIcon
                          status={
                            booking.bookingStatus
                          }
                        />

                        {booking.bookingStatus}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Info
                        label="Room"
                        value={
                          booking.room.roomLabel
                        }
                      />

                      <Info
                        label="Room type"
                        value={
                          booking.room.roomType
                            .name
                        }
                      />

                      <Info
                        label="Seat"
                        value={`Seat ${booking.seatNumber}`}
                      />

                      <Info
                        label="Total"
                        value={
                          Number.isFinite(price)
                            ? `LKR ${price.toLocaleString()}`
                            : booking.totalAmount
                        }
                      />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4 text-sm text-gray-500">
                      <CalendarDays className="size-4" />

                      <span>
                        {formatDate(
                          booking.leaseStart
                        )}{" "}
                        –{" "}
                        {formatDate(
                          booking.leaseEnd
                        )}
                      </span>
                    </div>

                    {booking.bookingStatus ===
                      "PENDING" && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          asChild
                          size="sm"
                        >
                          <Link
                            to={`/property-details/${property.id}`}
                          >
                            Continue booking
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            cancelMutation.isPending
                          }
                          onClick={() =>
                            handleCancel(
                              booking.id
                            )
                          }
                        >
                          Cancel hold
                        </Button>
                      </div>
                    )}

                    {booking.bookingStatus ===
                      "CONFIRMED" && (
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700">
                        <CheckCircle2 className="size-4" />
                        Reservation confirmed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-900">
        {value}
      </p>
    </div>
  )
}