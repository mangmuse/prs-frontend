import { HttpResponse, http } from "msw";

const generateGuestId = () => crypto.randomUUID();
const guestSessions = new Map<string, { guest_id: string; created_at: string }>();

export const handlers = [
  http.get("http://localhost:8000/health", () => {
    return HttpResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  }),

  http.post("http://localhost:8000/auth/guest", ({ cookies }) => {
    const existingGuestId = cookies.guest_id;

    if (existingGuestId && guestSessions.has(existingGuestId)) {
      return HttpResponse.json(guestSessions.get(existingGuestId));
    }

    const newGuestId = generateGuestId();
    const newSession = {
      guest_id: newGuestId,
      created_at: new Date().toISOString(),
    };

    guestSessions.set(newGuestId, newSession);

    return HttpResponse.json(newSession, {
      headers: {
        "Set-Cookie": `guest_id=${newGuestId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
      },
    });
  }),
];
