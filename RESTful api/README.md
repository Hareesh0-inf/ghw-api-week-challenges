## RESTAPI

### REST and Its Maturity

REST (Representational State Transfer) was introduced by Roy Fielding in 2000 to improve the **scalability and performance** of network-based systems using architectural principles. Over time, it became the industry standard for building web applications and services.

The **Richardson Maturity Model** outlines four levels of REST maturity:
- **Level 0**: HTTP used only as a transport mechanism (e.g., remote procedure calls).
- **Level 1**: Resources introduced with URIs.
- **Level 2**: HTTP methods and status codes properly used (e.g., GET, POST, PUT, DELETE).
- **Level 3**: Hypermedia as the engine of application state (HATEOAS) — responses include links to guide clients on next actions.

### Statelessness in REST

A key REST principle is **statelessness**. Each request from the client must contain **all the information needed** to understand and process it, with no stored context on the server. This enables:
- Scalability (any server can handle any request).
- High availability (failover is seamless).
- Easier caching and optimization.

Even with features like a shopping cart, you can still be stateless by:
1. **Storing the state externally** (in a database or memory cache).
2. **Associating user state via tokens** (like JSON Web Tokens - JWTs).

### Security Best Practices

1. Always use **HTTPS** to prevent man-in-the-middle attacks.
2. Use **token-based authentication** (e.g., JWTs), ensuring:
   - Tokens are securely stored on the client (protect against XSS/CSRF).
   - Tokens expire and are renewed periodically.
   - Tokens are strictly validated on the server.

### REST Endpoint Design: Good vs. Bad Examples

REST promotes a **resource-oriented** approach, not action-based. Let’s analyze and improve a bad example.

#### Bad Example:

```
GET /getOrderItems?id=123
```

This endpoint violates several best practices:

1. **Verb in URI**: REST relies on HTTP methods like `GET`, `POST`, so including "get" in the URI is redundant.
2. **Query parameter for resource**: It’s better to use **path parameters** for resource identification.
3. **No consistent naming**: The endpoint is not resource-focused.
4. **Singular nouns**: REST recommends using **plural resource names**.
5. **Trailing slash (e.g., /getOrderItems/)**: Adds no semantic value and may cause ambiguity.

#### Good Example:

```
GET /orders/123/items
```

Why this is better:
- Uses **plural nouns** ("orders", "items").
- **No verbs** in the URI; action is conveyed by the HTTP method (`GET`).
- **Path parameter** (`123`) clearly identifies the specific order.
- **Two-level hierarchy** that’s easy to read and understand.
- Clean and consistent formatting, possibly using **hyphens** in names for readability.

**Bonus**: Avoid deeply nested paths like `/store/5/customer/10/order/123/items`, which complicate routing and comprehension.

### API Responses: Format & Errors

- Always return **structured data** like **JSON** (preferred), XML, or YAML. Avoid plain text.
- JSON is favored for its **simplicity**, **efficiency**, and **broad support**.
- Use appropriate **HTTP status codes**:
  - `200 OK` – success.
  - `404 Not Found` – resource doesn’t exist.
  - `403 Forbidden` – access denied.
  - `500 Internal Server Error` – unexpected failures.

### Versioning Your APIs

API changes can have **ripple effects** across systems. Use **versioning** to maintain stability:
- Add version in the **URI** (`/v1/orders`).
- Or use **headers** (`Accept: application/vnd.myapi.v1+json`).

Versioning helps avoid breaking existing clients and makes APIs cache-friendly. However, some REST purists prefer not to change URIs for the same resource just because of version differences.

### Hypermedia (HATEOAS)

To fully embrace REST (Level 3), your API should follow **HATEOAS**:
- Clients navigate the application through **hypermedia links** included in responses.
- This enables **discoverability** and **self-descriptive** APIs.

Example:

```json
{
  "orderId": 123,
  "status": "shipped",
  "links": [
    { "rel": "cancel", "href": "/orders/123/cancel" },
    { "rel": "track", "href": "/orders/123/track" }
  ]
}
```

However, drawbacks include:
- **Performance cost** due to extra data.
- **No standard** implementation format.
- **Low adoption rate** in the industry.

---
