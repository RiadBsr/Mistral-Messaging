# Mistral Messaging App

This is a real-time messaging application built with Next.js and powered by Mistral AI. The app allows users to send and receive messages instantly along with seamless AI integration.

## Features

- Real-time messaging
- Google authentication
- AI-powered message suggestions
- Responsive design
- Easy to deploy

## Technologies Used

- Next.js
- Mistral AI
- Pusher
- Next Auth
- Redis

## Getting Started

### Prerequisites

- Node.js

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mistral-messaging-app.git
   ```
2. Navigate to the project directory:
   ```bash
   cd mistral-messaging-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Fill API Keys:
   ```bash
   NEXTAUTH_SECRET
   UPSTASH_REDIS_REST_URL
   UPSTASH_REDIS_REST_TOKEN
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   PUSHER_APP_ID
   NEXT_PUBLIC_PUSHER_APP_KEY
   PUSHER_APP_SECRET
   MISTRAL_API_KEY
   ```

### Running the App

1. Start the MongoDB server:
   ```bash
   mongod
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Sign in with Google.
2. Start a new conversation.
3. Send and receive messages in real-time.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License.

## Contact

For any questions or inquiries, please contact [yourname@example.com](mailto:yourname@example.com).

## Acknowledgements

Special thanks to the contributors and the open-source community for their invaluable support and resources.

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Mistral AI Documentation](https://mistral.ai/docs)
- [Pusher Documentation](https://pusher.com/docs)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [Google Authentication Documentation](https://developers.google.com/identity/sign-in/web/sign-in)

## Future Enhancements

- Implementing video and voice messaging
- Adding support for group chats
- Enhancing AI capabilities for better message suggestions
- Integrating with other third-party services

## Support

If you encounter any issues or have any questions, please open an issue on the GitHub repository or contact [riad.boussoura@gmail.com](mailto:riad.boussoura@gmail.com).
