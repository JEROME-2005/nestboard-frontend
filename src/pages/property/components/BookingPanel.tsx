import { useEffect, useState } from "react"
import { AlertCircle, Clock3 } from "lucide-react"
import { useNavigate } from "react-router"
import { ApiError } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuthStore } from "@/stores/authStore"
import {
  useConfirmBooking,
  useCreateBooking,
} from "@/hooks/useBookings"
import { useRoomTypeDetail } from "@/hooks/useRoomTypeDetail"

type BookingPanelProps = {
  propertyId: string
  roomTypeId: string
  roomTypeName: string
  monthlyPrice: string
  hasAC: boolean
  onClose: () => void
}

const DURATION_OPTIONS = [3, 6, 12]

function getCurrentMonth() {
  const date = new Date()

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`
}

function formatMonth(value: string) {
  const [year, month] = value.split("-")

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(
    new Date(
      Number(year),
      Number(month) - 1,
      1
    )
  )
}

function addMonths(
  startMonth: string,
  months: number
) {
  const [year, month] = startMonth
    .split("-")
    .map(Number)

  const date = new Date(
    year,
    month - 1 + months,
    1
  )

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`
}

export function BookingPanel({
  propertyId,
  roomTypeId,
  roomTypeName,
  monthlyPrice,
  hasAC,
  onClose,
}: BookingPanelProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [startMonth, setStartMonth] =
    useState(getCurrentMonth)

  const [durationMonths, setDurationMonths] =
    useState(3)

  const [selectedRoomId, setSelectedRoomId] =
    useState("")

  const [selectedSeat, setSelectedSeat] =
    useState<number | null>(null)

  const [createdBookingId, setCreatedBookingId] =
  useState<string | null>(() => {
    return sessionStorage.getItem(
      `nestboard_pending_booking_${propertyId}`
    )
  })
  const [createdAt, setCreatedAt] =
    useState<string | null>(null)

  const [error, setError] = useState("")

  const roomQuery = useRoomTypeDetail(
    propertyId,
    roomTypeId,
    startMonth,
    durationMonths
  )

  const createBooking = useCreateBooking()
  const confirmMutation = useConfirmBooking()

  const rooms = roomQuery.data?.rooms ?? []

  const selectedRoom = rooms.find(
    (room) => room.roomId === selectedRoomId
  )

  const price = Number(monthlyPrice)

  const total = Number.isFinite(price)
    ? price * durationMonths
    : 0

  useEffect(() => {
    setSelectedRoomId("")
    setSelectedSeat(null)
  }, [startMonth, durationMonths])

  function handleBook() {
    if (!user) {
      const returnTo =
        `${window.location.pathname}${window.location.search}`

      navigate(
        `/sign-in?returnTo=${encodeURIComponent(returnTo)}`
      )

      return
    }

    if (!selectedRoomId || selectedSeat === null) {
      setError("Select a room and an available seat.")
      return
    }

    setError("")

    createBooking.mutate(
      {
        roomId: selectedRoomId,
        seatNumber: selectedSeat,
        startMonth,
        durationMonths,
      },
      {
       onSuccess: () => {
  sessionStorage.removeItem(
    `nestboard_pending_booking_${propertyId}`
  )

  sessionStorage.removeItem(
    `nestboard_pending_booking_created_at_${propertyId}`
  )

  setCreatedBookingId(null)
  setCreatedAt(null)

  navigate("/bookings", {
    replace: true,
  })
},
        onError: (err) => {
          if (err instanceof ApiError) {
            if (
              err.status === 409 ||
              err.code === "CONFLICT"
            ) {
              setError(
                "This seat was just taken by another tenant. Availability has been refreshed."
              )

              void roomQuery.refetch()
              setSelectedSeat(null)
              return
            }

            setError(err.message)
            return
          }

          setError(
            "Unable to create the booking. Please try again."
          )
        },
      }
    )
  }

  function handleConfirm() {
    if (!createdBookingId) return

    setError("")

    confirmMutation.mutate(
      createdBookingId,
      {
        onSuccess: () => {
          setCreatedBookingId(null)
          setCreatedAt(null)

          navigate("/bookings", {
            replace: true,
          })
        },

        onError: (err) => {
          if (err instanceof ApiError) {
            if (
              err.status === 409 ||
              err.code === "CONFLICT"
            ) {
              setError(
                err.message ||
                  "The payment window has expired."
              )

              return
            }

            setError(err.message)
            return
          }

          setError(
            "Unable to confirm the booking."
          )
        },
      }
    )
  }

  if (createdBookingId && createdAt) {
    return (
      <PendingConfirmation
        createdAt={createdAt}
        onConfirm={handleConfirm}
        onClose={onClose}
        isConfirming={confirmMutation.isPending}
        error={error}
      />
    )
  }

  return (
    <Card className="mt-4 rounded-2xl p-5 shadow-sm ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Book {roomTypeName}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {hasAC ? "AC" : "Non-AC"} · LKR{" "}
            {price.toLocaleString()} / month
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="lease-start"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Lease start
          </label>

          <input
            id="lease-start"
            type="month"
            value={startMonth}
            min={getCurrentMonth()}
            onChange={(event) =>
              setStartMonth(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="lease-duration"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Duration
          </label>

          <select
            id="lease-duration"
            value={durationMonths}
            onChange={(event) =>
              setDurationMonths(
                Number(event.target.value)
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-primary"
          >
            {DURATION_OPTIONS.map((duration) => (
              <option
                key={duration}
                value={duration}
              >
                {duration} months
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-4">
        <p className="text-sm text-gray-500">
          Lease
        </p>

        <p className="mt-1 font-semibold text-gray-900">
          {formatMonth(startMonth)} →{" "}
          {formatMonth(
            addMonths(
              startMonth,
              durationMonths
            )
          )}
        </p>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-semibold text-gray-900">
          Select room
        </p>

        {roomQuery.isLoading ? (
          <p className="text-sm text-gray-500">
            Loading rooms...
          </p>
        ) : roomQuery.isError ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Could not load room availability.
          </div>
        ) : (
          <div className="grid gap-2">
            {rooms.map((room) => {
              const freeSeats = room.booking.filter(
                (seat) => !seat.tenant
              ).length

              return (
                <button
                  key={room.roomId}
                  type="button"
                  disabled={freeSeats === 0}
                  onClick={() => {
                    setSelectedRoomId(
                      room.roomId
                    )
                    setSelectedSeat(null)
                    setError("")
                  }}
                  className={[
                    "rounded-xl border p-3 text-left transition",
                    selectedRoomId ===
                    room.roomId
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50",
                    freeSeats === 0
                      ? "cursor-not-allowed opacity-50"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {room.roomName}
                    </span>

                    <span className="text-xs text-gray-500">
                      {freeSeats} free
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedRoom && (
        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-gray-900">
            Select seat
          </p>

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {selectedRoom.booking.map(
              (seat) => {
                const available =
                  !seat.tenant

                return (
                  <button
                    key={seat.seatIndex}
                    type="button"
                    disabled={!available}
                    onClick={() => {
                      setSelectedSeat(
                        seat.seatIndex
                      )
                      setError("")
                    }}
                    className={[
                      "rounded-lg border px-3 py-2 text-sm font-semibold",
                      selectedSeat ===
                      seat.seatIndex
                        ? "border-primary bg-primary text-white"
                        : available
                          ? "border-gray-200 bg-white hover:border-primary"
                          : "cursor-not-allowed bg-gray-100 text-gray-400",
                    ].join(" ")}
                  >
                    Seat {seat.seatIndex}
                  </button>
                )
              }
            )}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Monthly price
          </span>

          <span className="font-medium">
            LKR {price.toLocaleString()}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Duration
          </span>

          <span className="font-medium">
            {durationMonths} months
          </span>
        </div>

        <div className="mt-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              Total
            </span>

            <span className="text-xl font-bold text-primary">
              LKR {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        className="mt-5 w-full rounded-xl"
        size="lg"
        disabled={
          createBooking.isPending ||
          !selectedRoomId ||
          selectedSeat === null ||
          roomQuery.isLoading
        }
        onClick={handleBook}
      >
        {createBooking.isPending
          ? "Holding seat..."
          : user
            ? "Reserve seat"
            : "Sign in to reserve"}
      </Button>
    </Card>
  )
}

type PendingConfirmationProps = {
  createdAt: string
  onConfirm: () => void
  onClose: () => void
  isConfirming: boolean
  error: string
}

function PendingConfirmation({
  createdAt,
  onConfirm,
  onClose,
  isConfirming,
  error,
}: PendingConfirmationProps) {
  const PAYMENT_WINDOW_MS = 10 * 60 * 1000

  const [remaining, setRemaining] = useState(
    Math.max(
      0,
      PAYMENT_WINDOW_MS -
        (Date.now() -
          new Date(createdAt).getTime())
    )
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(
        Math.max(
          0,
          PAYMENT_WINDOW_MS -
            (Date.now() -
              new Date(createdAt).getTime())
        )
      )
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [createdAt])

  const expired = remaining <= 0

  const minutes = Math.floor(
    remaining / 60000
  )

  const seconds = Math.floor(
    (remaining % 60000) / 1000
  )

  return (
    <Card className="mt-4 rounded-2xl p-6 shadow-sm ring-1 ring-foreground/10">
      <div className="flex items-center gap-3">
        {expired ? (
          <AlertCircle className="size-6 text-red-500" />
        ) : (
          <Clock3 className="size-6 text-primary" />
        )}

        <div>
          <h3 className="font-bold text-gray-900">
            {expired
              ? "Payment window expired"
              : "Seat temporarily reserved"}
          </h3>

          <p className="text-sm text-gray-500">
            {expired
              ? "The seat hold has expired."
              : "Confirm your booking before the hold expires."}
          </p>
        </div>
      </div>

      {!expired && (
        <div className="mt-5 rounded-xl bg-primary/5 p-5 text-center">
          <p className="text-sm text-gray-500">
            Time remaining
          </p>

          <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!expired && (
        <Button
          className="mt-5 w-full rounded-xl"
          size="lg"
          disabled={isConfirming}
          onClick={onConfirm}
        >
          {isConfirming
            ? "Confirming..."
            : "Confirm booking"}
        </Button>
      )}

      {expired && (
        <Button
          variant="outline"
          className="mt-5 w-full rounded-xl"
          onClick={onClose}
        >
          Choose another seat
        </Button>
      )}
    </Card>
  )
}