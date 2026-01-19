export const en = {
  title: 'ui-prototype',
  auth: {
    login: 'Login',
    logout: 'Logout',
  },
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
  },
  actions: {
    ok: 'OK',
    reloadPage: 'Reload Page',
  },
  validations: {
    require: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    minLength: 'Please enter at least {{min}} characters',
    maxLength: 'Please enter no more than {{max}} characters',
    eitherEmailOrUsername: 'Please enter either email or username',
  },
  errors: {
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
  },
  homePage: {
    title: 'Dashboard',
    welcome: 'Welcome to Admin Dashboard. This is the main dashboard page.',
    overview: {
      title: 'System Overview',
      description: `I'm playing around with a modern web app setup.`,
    },
  },
  loginPage: {
    title: 'Login',
    subtitle: 'Please sign in to your account',
    form: {
      userId: 'Email Address or Username',
      password: 'Password',
      userIdPlaceholder: 'Enter your email or username',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      rememberMe: 'Remember me',
    },
    forgotPassword: 'Forgot Password?',
  },
  notFoundPage: {
    title: 'Page Not Found',
    description:
      'The page you are looking for has been deleted or is temporarily unavailable. Please check the URL or navigate to other pages using the buttons below.',
    actions: {
      goHome: 'Go Home',
      goBack: 'Go Back',
    },
  },
  crashPage: {
    title:
      'The page could not be displayed. Please refresh the page and try again.',
  },
  filesPage: {
    title: 'Document Post',
    subtitle: 'Manage uploaded documents',
    upload: {
      button: 'Add Document',
      title: 'Upload File',
      dropzone: 'Drop files here or click to select',
      selectButton: 'Select Files',
      acceptedFormats: 'Accepted formats: PDF, JPG, PNG (max 10MB)',
      maxFiles: 'Upload up to {{max}} files at once',
      progress: 'Uploading...',
      success: 'Upload completed',
      uploadButton: 'Upload',
      cancel: 'Cancel',
      description: 'Description (optional)',
      descriptionPlaceholder: 'Enter file description',
      tags: 'Tags',
      tagsPlaceholder: 'Select tags',
    },
    list: {
      empty: 'No files registered',
      emptySearch: 'No files found matching your search criteria',
      fileName: 'File Name',
      tags: 'Tags',
      uploadedAt: 'Uploaded At',
      size: 'Size',
      uploader: 'Uploader',
      actions: 'Actions',
      viewMode: 'View Mode',
      listView: 'List',
      gridView: 'Grid',
      sortBy: 'Sort By',
      sortByName: 'File Name',
      sortByUploadedAt: 'Updated At',
      sortBySize: 'Size',
      sortOrderAsc: 'Ascending',
      sortOrderDesc: 'Descending',
      itemsPerPage: '{{from}}-{{to}} / {{total}} items',
    },
    search: {
      placeholder: 'Search by file name or tags',
      clear: 'Clear',
      noResults: 'No search results found',
      searching: 'Searching...',
    },
    errors: {
      uploadFailed: 'Failed to upload file',
      fileTooLarge: 'File size is too large (max {{max}}MB)',
      invalidFormat: 'Unsupported file format',
      tooManyFiles: 'Too many files (max {{max}} files)',
      loadFailed: 'Failed to load file list',
      noFile: 'No file selected',
    },
    actions: {
      download: 'Download',
      view: 'View Details',
      edit: 'Edit',
      delete: 'Delete',
    },
  },
} as const;
