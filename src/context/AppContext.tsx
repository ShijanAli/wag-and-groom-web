"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface Pet {
  id: string;
  name: string;
  type: "Dog" | "Cat" | "Other";
  breed: string;
  age: string;
  weight: string;
  notes: string;
}

export interface Booking {
  id: string;
  petId: string;
  petName: string;
  service: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  price: number;
  notes: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  service: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending" | "Refunded";
  method: string;
}

interface AppState {
  pets: Pet[];
  bookings: Booking[];
  payments: Payment[];
  addPet: (pet: Omit<Pet, "id">) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const initialPets: Pet[] = [
  { id: "p1", name: "Buddy", type: "Dog", breed: "Golden Retriever", age: "4 years", weight: "30 kg", notes: "Friendly, loves treats" },
  { id: "p2", name: "Whiskers", type: "Cat", breed: "Persian", age: "2 years", weight: "5 kg", notes: "Shy at first" },
];

const initialBookings: Booking[] = [
  { id: "b1", petId: "p1", petName: "Buddy", service: "Full Grooming", date: "2026-03-10", time: "10:00 AM", status: "Confirmed", price: 40, notes: "", createdAt: "2026-03-06" },
  { id: "b2", petId: "p2", petName: "Whiskers", service: "Pet Spa Treatment", date: "2026-03-12", time: "2:00 PM", status: "Pending", price: 60, notes: "Use gentle shampoo", createdAt: "2026-03-07" },
  { id: "b3", petId: "p1", petName: "Buddy", service: "Dog Walking", date: "2026-02-28", time: "9:00 AM", status: "Completed", price: 20, notes: "", createdAt: "2026-02-25" },
];

const initialPayments: Payment[] = [
  { id: "pay1", bookingId: "b3", service: "Dog Walking", amount: 20, date: "2026-02-28", status: "Paid", method: "Visa •••• 4242" },
  { id: "pay2", bookingId: "b1", service: "Full Grooming", amount: 40, date: "2026-03-06", status: "Paid", method: "Visa •••• 4242" },
  { id: "pay3", bookingId: "b2", service: "Pet Spa Treatment", amount: 60, date: "2026-03-07", status: "Pending", method: "—" },
];

let nextId = 100;
const genId = (prefix: string) => `${prefix}${nextId++}`;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(initialPets);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const addPet = useCallback((pet: Omit<Pet, "id">) => {
    setPets((prev) => [...prev, { ...pet, id: genId("p") }]);
  }, []);

  const updatePet = useCallback((id: string, data: Partial<Pet>) => {
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, []);

  const deletePet = useCallback((id: string) => {
    setPets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addBooking = useCallback((booking: Omit<Booking, "id" | "createdAt">) => {
    const newBooking: Booking = {
      ...booking,
      id: genId("b"),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBookings((prev) => [...prev, newBooking]);
    setPayments((prev) => [
      ...prev,
      {
        id: genId("pay"),
        bookingId: newBooking.id,
        service: newBooking.service,
        amount: newBooking.price,
        date: newBooking.createdAt,
        status: "Pending",
        method: "—",
      },
    ]);
  }, []);

  const updateBooking = useCallback((id: string, data: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" as const } : b)));
    setPayments((prev) =>
      prev.map((p) => (p.bookingId === id && p.status === "Pending" ? { ...p, status: "Refunded" as const } : p))
    );
  }, []);

  return (
    <AppContext.Provider value={{ pets, bookings, payments, addPet, updatePet, deletePet, addBooking, updateBooking, cancelBooking }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
