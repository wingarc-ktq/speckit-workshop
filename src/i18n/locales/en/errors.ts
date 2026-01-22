export const errors = {
  title: {
    error: 'Error',
  },
  general: {
    networkError:
      'A network error has occurred. Please check your network connection.',
    unknownError: 'An unknown error has occurred.',
  },
  auth: {
    invalidCredentials: 'Invalid email address (or username) or password.',
    noSession: 'Session does not exist. Please login again.',
    sessionExpired: 'Session has expired. Please login again.',
    networkError:
      'Failed to communicate with authentication server. Please try again later.',
  },
  http: {
    internalServerError:
      'The system is currently busy. Please try again later.',
    badRequest: 'Invalid parameters were sent.',
    notLoggedIn: 'You are not logged in.',
    forbidden:
      'You do not have permission to perform this operation. If the problem persists, please reload your browser.',
    notFound: 'The target was not found.',
    payloadTooLarge: 'Data size limit exceeded.',
    serviceUnavailable:
      'The server is temporarily busy or under maintenance. Please try again later.',
    gatewayTimeout: 'The server did not respond in time.',
  },
} as const;
