/**
 * src/services/userService.js
 * All API calls in one place — keeps fetch logic out of components.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/**
 * POST /api/users — save user form data
 * Returns { userId } on success, throws Error on failure.
 *
 * @param {{ fullName: string, email: string, university: string, department: string }} data
 * @returns {Promise<{ userId: number }>}
 */
export async function saveUser(data) {
    const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(json?.error ?? `Request failed (${response.status})`);
    }

    return json; // { userId }
}