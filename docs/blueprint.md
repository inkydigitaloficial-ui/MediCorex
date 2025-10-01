# **App Name**: TenantFlow

## Core Features:

- Middleware Routing: Route requests based on subdomains to respective tenant directories.
- Tenant Layout Validation: Apply a specific layout for each tenant with Firestore validation to ensure data security and integrity.
- useTenant Hook: Provide tenant context throughout the application using a custom React hook.
- Genkit Customer Insights: Use Genkit flows to generate customer insights, incorporating tenantId validation for data isolation and relevance. Genkit flow includes a tool that determines whether the insights need to reference user behavior or user attributes.
- Firestore Security Rules: Implement multi-tenant security rules in Firestore to protect tenant data.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) to establish a sense of trust and stability.
- Background color: Light grayish-blue (#F0F4FF), nearly desaturated indigo, providing a calm backdrop that contrasts with the primary color.
- Accent color: A vibrant violet (#7E57C2), which is analogous to indigo, will be used for interactive elements.
- Headline font: 'Space Grotesk' sans-serif font for headlines. Body font: 'Inter', a clean sans-serif font.
- Use minimalist icons to represent different functionalities within the app, ensuring clarity and ease of use.
- Maintain a clean and structured layout with clear divisions between sections for ease of navigation and content consumption.
- Incorporate subtle transitions and animations to enhance user experience without being distracting.