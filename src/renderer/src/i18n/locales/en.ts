const en = {
  common: {
    signIn: 'Sign In',
    signOut: 'Sign out',
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    refresh: 'Refresh',
    cancel: 'Cancel',
    confirm: 'Confirm',
    reset: 'Reset',
    settings: 'Settings',
    dashboard: 'Dashboard',
    about: 'About',
    welcome: 'Welcome',
    beta: 'Beta',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    close: 'Close',
    back: 'Back',
    search: 'Search…',
    export: 'Export',
    columns: 'Columns',
    toggleColumns: 'Toggle Columns',
    noRecordsFound: 'No records found',
    showing: 'Showing',
    of: 'of',
    page: 'Page',
    perPageOption: '{{count}} / page',
    row: 'row',
    rows: 'rows',
    yes: 'Yes',
    no: 'No',
    actions: 'Actions',
    processing: 'Processing…',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    paid: 'Paid',
    unpaid: 'Unpaid',
    overdue: 'Overdue'
  },
  roles: {
    super_admin: 'Super Admin',
    admin: 'Admin',
    cashier: 'Cashier',
    accountant: 'Accountant',
    hr: 'HR',
    inventory_clerk: 'Inventory Clerk',
    manager: 'Manager'
  },
  sidebar: {
    orgTooltip: 'Girl Scouts of the Philippines · Ilocos Sur',
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    guest: 'Guest',
    myProfile: 'My Profile',
    groups: {
      goals: 'Goals & Objectives',
      hrPayroll: 'HR & Payroll',
      facility: 'Facility',
      accounting: 'Accounting',
      admin: 'Admin'
    },
    nav: {
      dashboard: 'Dashboard',
      pos: 'Point of Sale',
      products: 'Inventory',
      members: 'Members',
      employees: 'Employees',
      troops: 'Troops',
      attendance: 'Attendance',
      leave: 'Leave Requests',
      payroll: 'Payroll',
      orgChart: 'Organizational Chart',
      vouchers: 'Vouchers',
      rentals: 'Rental Bookings',
      invoices: 'Invoices',
      customers: 'Customers',
      expenses: 'Expenses',
      vendors: 'Vendors',
      items: 'Products & Services',
      reports: 'Reports',
      scrd: 'Cash Receipts & Disb.',
      users: 'User Accounts',
      auditLog: 'Audit Log',
      settings: 'Settings',
      devices: 'Devices',
      about: 'About',
      enrollment: 'Enrollment',
      goals: 'Goals & Objectives'
    }
  },
  titleBar: {
    minimize: 'Minimize',
    maximize: 'Maximize',
    close: 'Close',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    searchShortcut: 'Search (Ctrl+K)',
    searchPlaceholder: 'Search…',
    esc: 'Esc',
    notifications: 'Notifications',
    clearAll: 'Clear all',
    noNotifications: 'No notifications',
    home: 'Home'
  },
  auth: {
    welcomeBack: 'Welcome back',
    signInSubtitle: 'Sign in to continue to your workspace',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'Enter your email address',
    passwordPlaceholder: 'Enter your password',
    demo: 'Contact your administrator if you don’t have an account yet.',
    emailRequired: 'A valid email address is required.',
    passwordMinLength: 'Password must be at least 6 characters.',
    errors: {
      invalidCredentials: 'Incorrect email or password.',
      userDisabled: 'This account has been disabled. Contact your administrator.',
      tooManyRequests: 'Too many attempts. Please wait a moment and try again.',
      network: 'Network error — check your connection and try again.',
      generic: 'Sign-in failed. Please try again.'
    }
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: "Here's how your business is doing.",
    refreshButton: 'Refresh',
    refreshToast: 'Data refreshed',
    newExpenseButton: 'New Expense',
    newInvoiceButton: 'New Invoice',
    statCashBalance: 'Total Cash & Bank Balance',
    cashBalanceNote: 'Across {{count}} bank account(s)',
    bankBalancesTitle: 'Bank Balances',
    statIncome: 'Income (paid)',
    statExpenses: 'Expenses',
    statNetProfit: 'Net Profit',
    statOutstandingInvoices: 'Outstanding Invoices',
    vsLastPeriod: 'vs last period',
    outstandingNote: '{{count}} invoice(s) awaiting payment',
    cashFlowTitle: 'Invoiced Amount Over Time',
    cashFlowSubtitle: 'Last ~120 days, by 15-day period',
    invoicedSeriesName: 'Invoiced',
    invoicesTitle: 'Invoices',
    overdueBadge: 'Overdue',
    notDueYetBadge: 'Not due yet',
    expensesByCategoryTitle: 'Expenses by Category',
    noExpensesRecorded: 'No expenses recorded yet.',
    lowStockLabel: 'Low Stock Items',
    lowStockExample: 'e.g. {{name}}',
    lowStockAllStocked: 'All items well stocked',
    attendanceLabel: "Today's Attendance",
    attendanceDetail: '{{onLeave}} on leave · {{absent}} absent',
    pendingLeaveLabel: 'Pending Leave Requests',
    pendingLeaveNeedsReview: 'Needs review',
    pendingLeaveAllCaughtUp: 'All caught up',
    recentActivityTitle: 'Recent Activity',
    viewAll: 'View all'
  },
  settings: {
    title: 'Settings',
    subtitle: 'Customize your AionX experience.',
    appearance: 'Appearance',
    appearanceDesc: 'Customize the look and feel',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Switch between dark and light interface theme',
    accentColor: 'Accent Color',
    accentColorDesc: 'Choose your primary interface color',
    fontSize: 'Font Size',
    fontSizeDesc: 'Adjust the base font size for readability',
    compactMode: 'Compact Mode',
    compactModeDesc: 'Reduce spacing for denser information display',
    language: 'Language',
    notifications: 'Notifications',
    notificationsDesc: 'Control what notifications you receive',
    enableNotifications: 'Enable Notifications',
    enableNotificationsDesc: 'Show system notifications for important events',
    soundAlerts: 'Sound Alerts',
    soundAlertsDesc: 'Play a sound when notifications arrive',
    updateNotifications: 'Update Notifications',
    updateNotificationsDesc: 'Notify when a new version is available',
    securityAlerts: 'Security Alerts',
    securityAlertsDesc: 'Alert on suspicious activity',
    marketingEmails: 'Marketing Emails',
    marketingEmailsDesc: 'Receive product updates and announcements',
    security: {
      title: 'Security',
      description: 'Change your account password',
      currentPasswordLabel: 'Current Password',
      newPasswordLabel: 'New Password',
      confirmPasswordLabel: 'Confirm New Password',
      updateButton: 'Update Password',
      toast: {
        updated: 'Password updated successfully'
      },
      errors: {
        wrongCurrentPassword: 'Current password is incorrect.',
        weakPassword: 'New password is too weak — use at least 6 characters.',
        requiresRecentLogin: 'Please sign out and back in, then try again.',
        mismatch: 'New password and confirmation do not match.',
        generic: 'Failed to update password. Please try again.'
      }
    },
    barcodeScanner: {
      title: 'Barcode Scanner',
      description: 'Connect a USB or Bluetooth barcode scanner for fast lookups in Point of Sale.',
      status: {
        idle: 'Not tested yet',
        detected: 'Scanner detected'
      },
      usbTitle: 'USB (wired or wireless dongle)',
      usbStep1: 'Plug the scanner, or its USB receiver, into a USB port.',
      usbStep2:
        'Windows detects it automatically as a keyboard — no driver needed for most models.',
      usbStep3: 'Scan a product barcode below to confirm it works.',
      bluetoothTitle: 'Bluetooth',
      bluetoothStep1: 'Open Windows Settings → Bluetooth & devices → Add device.',
      bluetoothStep2:
        'Put the scanner into pairing mode (hold its pairing button, or scan the "pairing" barcode in its manual).',
      bluetoothStep3: 'Select the scanner from the list and pair.',
      bluetoothStep4: 'Scan a product barcode below to confirm it works.',
      openBluetoothSettings: 'Open Bluetooth Settings',
      testTitle: 'Test your scanner',
      testHint:
        'Scan any barcode — the result appears below. This works anywhere on this page except while typing in a text field.',
      waiting: 'Waiting for a scan…',
      lastScanLabel: 'Last scan',
      clearButton: 'Clear',
      posNote: 'In Point of Sale, a scanned code is matched against each product’s SKU.'
    },
    biometricDevice: {
      title: 'Biometric Terminal',
      description: 'Connect the Hikvision face recognition terminal for real-time attendance',
      hostLabel: 'IP Address',
      portLabel: 'Port',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      passwordSavedPlaceholder: 'Saved — leave blank to keep',
      useHttpsLabel: 'Device uses HTTPS',
      testButton: 'Test Connection',
      connectButton: 'Connect',
      disconnectButton: 'Disconnect',
      status: {
        disconnected: 'Disconnected',
        connecting: 'Connecting…',
        connected: 'Connected',
        error: 'Error'
      },
      toast: {
        hostRequired: 'Device IP address is required',
        saved: 'Device settings saved',
        testFailed: 'Connection test failed',
        connectFailed: 'Failed to connect to the device',
        saveFailed: 'Failed to save device settings',
        apiUnavailable:
          'This feature needs a full app restart to load — close and reopen AionX, then try again.'
      }
    },
    receiptPrinter: {
      title: 'Receipt Printer & Cash Drawer',
      description:
        'Print sale receipts silently at checkout, with no OS print dialog, to a Windows-installed receipt printer.',
      printerLabel: 'Printer',
      systemDefault: 'System default printer',
      default: 'Default',
      autoPrintLabel: 'Auto-print receipt after sale',
      autoPrintDesc:
        'When on, a receipt prints automatically after every completed sale. Cashiers can still turn this off per sale from the Point of Sale screen.',
      testButton: 'Send Test Print',
      testSuccess: 'Test receipt sent to the printer',
      testFailure: 'Test print failed: {{error}}',
      drawerNote:
        'Cash drawer tip: if your drawer is wired into this printer’s RJ11/RJ12 port, enable “Open cash drawer when printing” (sometimes called “kick drawer”) in the printer’s Windows driver — Devices & Printers → right-click the printer → Printer properties → Device settings. Once that’s on, every printed receipt also pops the drawer.'
    },
    membershipYear: {
      title: 'Membership Year',
      description:
        'The month each annual Girl Scout membership cycle starts — every troop and member renews on this schedule.',
      startMonthLabel: 'Cycle starts in',
      currentCycle: 'Current cycle: {{year}}',
      adminOnlyNote:
        'Only Super Admin and Admin can change this — it applies to the whole council, on every device.',
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      toast: {
        saved: 'Membership year cycle updated'
      }
    },
    privacy: 'Privacy',
    privacyDesc: 'Manage your data and privacy preferences',
    dataCollection: 'Usage Analytics',
    dataCollectionDesc: 'Help improve AionX by sharing anonymized usage data',
    crashReports: 'Crash Reports',
    crashReportsDesc: 'Automatically send crash reports to help fix bugs',
    telemetry: 'Telemetry',
    telemetryDesc: 'Share performance metrics with the team',
    advanced: 'Advanced',
    advancedDesc: 'Developer settings and maintenance',
    resetSettings: 'Reset Settings',
    resetSettingsDesc: 'Reset all settings to default values',
    resetConfirmTitle: 'Reset Settings',
    resetConfirmDesc:
      'This will reset all settings to their defaults. This action cannot be undone.',
    dark: 'Dark',
    light: 'Light'
  },
  devices: {
    title: 'Devices',
    subtitle: 'Connect and test hardware used by AionX.'
  },
  profile: {
    title: 'My Profile',
    subtitle: 'Your account details and photo.',
    changePhoto: 'Change photo',
    toast: {
      photoUpdated: 'Photo updated',
      photoFailed: 'Failed to upload photo'
    }
  },
  about: {
    tagline:
      'Business, HR & Financial Management System for the Girl Scouts of the Philippines — Ilocos Sur Council.',
    techStackHeading: 'Tech Stack',
    buildInfoHeading: 'Build Information',
    buildToolLabel: 'Build Tool',
    nodeTargetLabel: 'Node Target',
    rendererTargetLabel: 'Renderer Target',
    architectureLabel: 'Architecture',
    licenseLabel: 'License',
    footerCredits: 'Built with electron-vite · React 19 · TypeScript · Tailwind CSS',
    footerDevelopedBy: 'Developed by AionX IT Solutions for GSP Ilocos Sur Council.'
  },
  updates: {
    checking: 'Checking for updates...',
    available: 'Update available',
    notAvailable: 'You are up to date',
    downloading: 'Downloading update...',
    downloaded: 'Update downloaded',
    readyToInstall: 'Restart to install update',
    error: 'Update error',
    installNow: 'Install Now'
  },
  employees: {
    title: 'Employee Management',
    addButton: 'Add Employee',
    searchPlaceholder: 'Search employees…',
    empty: 'No employees found',
    table: {
      employeeNumber: 'Employee #',
      name: 'Name',
      position: 'Position',
      department: 'Department',
      branch: 'Branch',
      salary: 'Salary',
      status: 'Status',
      deactivate: 'Deactivate',
      reactivate: 'Reactivate'
    },
    modal: {
      addTitle: 'Add Employee',
      editTitle: 'Edit Employee',
      saveChanges: 'Save Changes'
    },
    form: {
      employeeNumber: 'Employee #',
      hireDate: 'Hire Date',
      fullName: 'Full Name',
      position: 'Position',
      department: 'Department',
      branch: 'Branch',
      reportsTo: 'Reports To',
      noManager: 'No manager (top of chart)',
      linkedUser: 'Linked User Account',
      noLinkedUser: 'No linked account',
      salary: 'Monthly Salary',
      email: 'Email',
      phone: 'Phone',
      payrollDefaultsHeading: 'Default Payroll Amounts (prefilled into new Payroll Entries)',
      defaultCola: 'COLA',
      defaultRepresentation: 'Representation',
      defaultSss: 'SSS',
      defaultPhilhealth: 'PhilHealth',
      defaultPagibig: 'Pag-IBIG',
      defaultWithholdingTax: 'Withholding Tax'
    },
    toast: {
      validationRequired: 'Employee #, name, and position are required',
      updated: 'Employee updated',
      created: '{{name}} added to employees',
      deactivated: '{{name}} deactivated',
      reactivated: '{{name}} reactivated',
      deleted: '{{name}} deleted'
    },
    confirmDeactivate: {
      title: 'Deactivate Employee',
      message:
        'Deactivate {{name}}? They will be hidden from active employee pickers used in Attendance and Payroll.'
    },
    confirmReactivate: {
      title: 'Reactivate Employee',
      message: 'Reactivate {{name}}?'
    },
    confirmDelete: {
      title: 'Delete Employee',
      message:
        'Delete {{name}}? This removes their employee record permanently. Existing attendance, leave, and payroll records tied to them will not be removed. This cannot be undone.'
    },
    profile: {
      viewProfile: 'View Profile',
      changePhoto: 'Change photo',
      uploadingPhoto: 'Uploading…',
      removePhoto: 'Remove photo',
      documentsHeading: 'Documents',
      noDocuments: 'No documents uploaded yet',
      documentLabelPlaceholder: 'Label (optional — defaults to filename)',
      chooseFiles: 'Choose files',
      uploadButton: 'Upload',
      viewDocument: 'View',
      downloadDocument: 'Download',
      documentTypes: {
        resume: 'Resume',
        transcript: 'Transcript / Grades',
        certification: 'Certification',
        other: 'Other'
      },
      confirmDeleteDocument: {
        title: 'Delete Document',
        message: 'Delete this document? This cannot be undone.'
      },
      confirmDeletePhoto: {
        title: 'Remove Photo',
        message: "Remove this employee's photo? This cannot be undone."
      },
      toast: {
        photoUpdated: 'Photo updated',
        photoFailed: 'Failed to upload photo',
        photoRemoved: 'Photo removed',
        photoRemoveFailed: 'Failed to remove photo',
        documentUploaded: 'Document uploaded',
        documentFailed: 'Failed to upload document',
        documentDeleted: 'Document deleted',
        documentDownloadFailed: 'Failed to download document'
      }
    }
  },
  troops: {
    title: 'Troops & Membership',
    subtitle: 'Membership year {{year}}',
    addButton: 'Add Troop',
    searchPlaceholder: 'Search troops…',
    empty: 'No troops found',
    viewRoster: 'View Roster',
    table: {
      troopNumber: 'Troop #',
      troopName: 'Troop Name',
      level: 'Level',
      leaderName: 'Troop Leader',
      members: 'Members',
      needsRenewal: '{{count}} need renewal',
      status: 'Status',
      deactivate: 'Deactivate',
      reactivate: 'Reactivate'
    },
    modal: {
      addTitle: 'Add Troop',
      editTitle: 'Edit Troop',
      saveChanges: 'Save Changes'
    },
    form: {
      troopNumber: 'Troop #',
      level: 'Level',
      levelPlaceholder: 'e.g. Star Scout, Junior, Cadette, Senior, Ambassador',
      troopName: 'Troop Name',
      leaderName: 'Troop Leader',
      assistantLeaderName: 'Assistant Troop Leader',
      school: 'School / Community',
      barangay: 'Barangay',
      meetingPlace: 'Meeting Place'
    },
    confirmDeactivate: {
      title: 'Deactivate Troop',
      message:
        'Deactivate Troop {{troopNumber}}? It will be hidden from active troop pickers. This does not affect its members.'
    },
    confirmReactivate: {
      title: 'Reactivate Troop',
      message: 'Reactivate Troop {{troopNumber}}?'
    },
    confirmDelete: {
      title: 'Delete Troop',
      message:
        'Delete Troop {{troopNumber}}? This also permanently removes every member on its roster. This cannot be undone.'
    },
    toast: {
      validationRequired: 'Troop #, level, and troop leader are required',
      created: 'Troop {{troopNumber}} added',
      updated: 'Troop updated',
      deleted: 'Troop {{troopNumber}} deleted',
      deactivated: 'Troop {{troopNumber}} deactivated',
      reactivated: 'Troop {{troopNumber}} reactivated'
    },
    roster: {
      heading: 'Member Roster',
      addButton: 'Add Member',
      empty: 'No members registered in this troop yet',
      renewButton: 'Renew for this membership year',
      table: {
        fullName: 'Name',
        birthdate: 'Birthdate',
        level: 'Level',
        guardian: 'Guardian',
        membership: 'Membership',
        current: 'Current — {{year}}',
        needsRenewalBadge: 'Needs renewal — last {{year}}'
      },
      modal: {
        addTitle: 'Add Member',
        editTitle: 'Edit Member'
      },
      form: {
        fullName: 'Full Name',
        birthdate: 'Birthdate',
        level: 'Level',
        guardianName: 'Guardian Name',
        guardianContact: 'Guardian Contact',
        address: 'Address'
      },
      confirmDeactivate: {
        title: 'Deactivate Member',
        message:
          'Deactivate {{name}}? They will be hidden from the active roster and renewal tracking.'
      },
      confirmReactivate: {
        title: 'Reactivate Member',
        message: 'Reactivate {{name}}?'
      },
      confirmDelete: {
        title: 'Delete Member',
        message: 'Delete {{name}} from this troop? This cannot be undone.'
      },
      toast: {
        validationRequired: 'Full name and birthdate are required',
        created: '{{name}} added to the roster',
        updated: 'Member updated',
        deleted: '{{name}} removed from the roster',
        deactivated: '{{name}} deactivated',
        reactivated: '{{name}} reactivated',
        renewed: '{{name}} renewed for membership year {{year}}'
      }
    }
  },
  attendance: {
    title: 'Attendance',
    enrollmentButton: 'Enrollment',
    manualEntryButton: 'Manual Entry',
    empty: 'No attendance records for this range',
    summary: {
      records: 'Records',
      present: 'Present',
      late: 'Late',
      overtime: 'Overtime',
      overtimeHours: '{{hours}}h',
      overtimeRecords: '{{count}} record(s)',
      onLeave: 'On Leave',
      absent: 'Absent'
    },
    filters: {
      to: 'to',
      allEmployees: 'All employees'
    },
    table: {
      date: 'Date',
      employee: 'Employee',
      clockIn: 'Clock In',
      clockOut: 'Clock Out',
      hours: 'Hours',
      status: 'Status',
      notes: 'Notes',
      action: 'Action'
    },
    status: {
      present: 'Present',
      late: 'Late',
      'half-day': 'Half-day',
      absent: 'Absent',
      leave: 'Leave',
      overtime: 'Overtime'
    },
    modal: {
      title: 'Manual Attendance Entry'
    },
    form: {
      selectEmployee: 'Select employee'
    },
    toast: {
      selectEmployee: 'Select an employee',
      recorded: 'Attendance recorded',
      deleted: 'Attendance record deleted'
    },
    confirmDelete: {
      title: 'Delete Attendance Record',
      message: 'Delete the attendance record for {{name}} on {{date}}? This cannot be undone.'
    }
  },
  leave: {
    title: 'Leave Management',
    fileLeaveButton: 'File Leave',
    approveButton: 'Approve',
    rejectButton: 'Reject',
    revertButton: 'Revert to Rejected',
    empty: 'No leave requests filed yet',
    previewDaysPrefix: 'This request covers',
    previewDaysSuffix: 'day(s).',
    balances: {
      title: 'Leave Balances',
      days: 'days'
    },
    balancesModal: {
      editButton: 'Edit Balances',
      title: 'Edit Leave Balances',
      description:
        'Set the annual credit pool per leave type. Compensatory Time Off is earned from overtime and isn’t editable here.',
      saved: 'Leave balances updated'
    },
    confirmRevert: {
      title: 'Revert Approval',
      reasonPlaceholder: 'e.g. Filed by mistake'
    },
    confirmDeleteRequest: {
      title: 'Delete Leave Request',
      message: 'Delete this {{leaveType}} request for {{name}}? This cannot be undone.'
    },
    table: {
      employee: 'Employee',
      leaveType: 'Leave Type',
      from: 'From',
      to: 'To',
      days: 'Days',
      reason: 'Reason',
      status: 'Status',
      action: 'Action'
    },
    modal: {
      fileTitle: 'File Leave Request',
      submit: 'Submit',
      approveTitle: 'Approve Leave Request',
      rejectTitle: 'Reject Leave Request',
      confirmApproval: 'Confirm Approval',
      confirmRejection: 'Confirm Rejection',
      summary: '{{employee}} — {{leaveType}} ({{start}} to {{end}}, {{days}} day(s))'
    },
    form: {
      selectEmployee: 'Select employee',
      selectLeaveType: 'Select leave type',
      startDate: 'Start Date',
      endDate: 'End Date',
      halfDay: 'Half day (0.5 day)',
      notesOptional: 'Notes (optional)',
      notesPlaceholder: 'e.g. Medical certificate on file'
    },
    toast: {
      validationRequired: 'Employee and leave type are required',
      endDateInvalid: 'End date must be on or after start date',
      insufficientBalance:
        'Not enough {{leaveType}} balance — {{remaining}} day(s) remaining, {{days}} requested',
      filed: 'Leave request filed',
      decided: 'Leave request {{status}}',
      approvedSynced: 'Approved dates synced to Attendance as "leave"',
      reverted: 'Leave approval reverted to rejected',
      requestDeleted: 'Leave request deleted'
    }
  },
  payroll: {
    title: 'Payroll',
    exportButton: 'Export Register',
    newEntryButton: 'New Payroll Entry',
    pullFromAttendance: 'Pull from Attendance & Leave',
    approveButton: 'Approve',
    markPaidButton: 'Mark Paid',
    empty: 'No payroll entries yet',
    summary: {
      totalNet: 'Total Net Payroll',
      pending: 'Pending',
      paid: 'Paid'
    },
    filters: {
      allYears: 'All years',
      allPeriods: 'All periods'
    },
    table: {
      payrollNumber: 'Payroll #',
      employee: 'Employee',
      period: 'Period',
      basic: 'Basic',
      representation: 'Representation',
      unpaidLeave: 'Unpaid Leave',
      deductions: 'Deductions',
      netPay: 'Net Pay',
      status: 'Status',
      action: 'Action'
    },
    modal: {
      title: 'New Payroll Entry',
      createEntry: 'Create Entry'
    },
    form: {
      selectEmployee: 'Select employee',
      periodStart: 'Period Start',
      periodEnd: 'Period End',
      basicSalary: 'Basic Salary',
      monthlySalaryReference: 'Monthly Salary: {{amount}}',
      daysWorked: 'Days Worked',
      overtimePay: 'Overtime Pay',
      cola: 'COLA',
      representation: 'Representation',
      sss: 'SSS',
      philhealth: 'PhilHealth',
      pagibig: 'Pag-IBIG',
      withholdingTax: 'Withholding Tax',
      unpaidLeaveDays: 'Unpaid Leave Days'
    },
    preview: {
      basicPay: 'Basic pay (daily rate × days worked)',
      unpaidLeaveDeduction: 'Unpaid leave deduction',
      totalDeductions: 'Total deductions',
      netPay: 'Net Pay'
    },
    toast: {
      selectEmployeePeriod: 'Select employee and period first',
      attendanceSummary:
        'Attendance: {{present}} present, {{absent}} absent, {{leave}} on leave, {{unpaid}} unpaid leave day(s) (≈{{deduction}} deduction)',
      selectEmployee: 'Select an employee',
      entryCreated: 'Payroll entry created',
      noEntriesToExport: 'No payroll entries to export',
      exportedExcel: 'Payroll register exported in the Council’s official format',
      exportedPdf: 'Payroll register exported as PDF',
      exportedWord: 'Payroll register exported as Word document',
      statusUpdated: 'Payroll {{number}} marked as {{status}}'
    },
    confirmApprove: {
      title: 'Approve Payroll',
      message: 'Approve payroll entry {{number}} for {{amount}}?'
    },
    confirmMarkPaid: {
      title: 'Mark Payroll as Paid',
      message: 'Mark payroll entry {{number}} ({{amount}}) as paid? This cannot be undone.'
    }
  },
  orgChart: {
    title: 'Organizational Chart',
    subtitle: '{{count}} active employee(s) — click anyone to open their profile',
    empty:
      'No active employees yet — add employees and set who each one reports to in the Employee form.',
    directReportsCount: '{{count}} direct report(s)',
    editLayout: 'Edit Layout',
    doneEditing: 'Done Editing',
    editHint: 'Drag an employee card onto another to change who they report to.',
    unassignDropZone: 'Drop here to remove a reporting manager'
  },
  biometricKiosk: {
    title: 'Biometric Enrollment',
    subtitle: 'Manage which employees are enrolled for biometric attendance',
    backButton: 'Back to Attendance',
    enrolledEmployees: 'Enrolled Employees',
    unenrollButton: 'Unenroll',
    enrollButton: 'Enroll',
    empty: 'No employees found',
    table: {
      employee: 'Employee',
      position: 'Position',
      method: 'Method',
      status: 'Status',
      action: 'Action'
    },
    status: {
      enrolled: 'Enrolled',
      notEnrolled: 'Not enrolled'
    },
    modal: {
      enrollTitle: 'Enroll {{name}}',
      note: "Simulates capturing the employee's biometric template on an enrollment device.",
      methodOptions: {
        fingerprintOnly: 'Fingerprint only',
        faceOnly: 'Face recognition only',
        both: 'Fingerprint + Face'
      },
      deviceEnrollLabel: 'Also register on the terminal (optional)',
      deviceEnrollNote:
        "Upload a clear front-facing photo to register this employee's face on the connected terminal.",
      deviceNotConnected:
        'Terminal not connected — connect it in Settings to enroll a face there too.'
    },
    toast: {
      unenrolled: '{{name}} unenrolled',
      enrolled: '{{name}} enrolled for biometric attendance',
      deviceEnrolled: "{{name}}'s face registered on the terminal",
      deviceEnrollFailed: 'Failed to register the face on the terminal'
    },
    confirmUnenroll: {
      title: 'Unenroll Employee',
      message:
        'Unenroll {{name}} from biometric attendance? They will not be able to clock in/out via the terminal until re-enrolled.'
    }
  },
  rentals: {
    title: 'Facility & Rental Management',
    newBookingButton: 'New Booking',
    addSpaceButton: 'Add Room',
    perDay: '/day',
    capacity: 'Cap.',
    bookingsTitle: 'Bookings',
    empty: 'No bookings yet',
    noSpaces: 'No rooms or spaces yet — click "Add Room" to create one.',
    confirmButton: 'Confirm',
    markCompletedButton: 'Mark Completed',
    table: {
      space: 'Space',
      date: 'Date',
      renter: 'Renter / Purpose',
      amount: 'Amount',
      payment: 'Payment',
      status: 'Status',
      action: 'Action'
    },
    status: {
      reserved: 'Reserved',
      confirmed: 'Confirmed'
    },
    payment: {
      unpaid: 'Unpaid',
      downPayment: 'Down Payment',
      fullyPaid: 'Fully Paid'
    },
    modal: {
      title: 'New Booking',
      editTitle: 'Edit Booking',
      bookButton: 'Book Space',
      addSpaceTitle: 'Add Room / Space',
      editSpaceTitle: 'Edit Room / Space',
      saveSpace: 'Save Room'
    },
    form: {
      space: 'Space',
      selectSpace: 'Select space',
      bookingDate: 'Booking Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      renterName: 'Renter Name / Purpose',
      discount: 'Discount',
      discountNone: 'None',
      discountPwdSenior: 'PWD / Senior Citizen (-20%)',
      discountAmountLabel: 'Discount',
      requiredDownPayment: 'Required down payment (50%)',
      amountPaid: 'Amount Paid',
      notes: 'Notes',
      image: 'Photo',
      spaceName: 'Room / Space Name',
      description: 'Description',
      ratePerDay: 'Rate per Day',
      capacityField: 'Capacity'
    },
    toast: {
      validationRequired: 'Space and renter name are required',
      created: 'Booking created',
      updated: 'Booking updated',
      deleted: 'Booking removed',
      confirmed: 'Booking confirmed',
      completed: 'Booking completed',
      nameRequired: 'Room / space name is required',
      spaceAdded: '"{{name}}" added',
      spaceUpdated: '"{{name}}" updated',
      spaceDeleted: '"{{name}}" removed'
    },
    confirmDeleteSpace: {
      title: 'Delete this room/space?',
      message: '"{{name}}" will be removed and will no longer be available for new bookings.'
    },
    confirmDeleteBooking: {
      title: 'Delete this booking?',
      message: 'The booking for "{{name}}" will be permanently removed.'
    }
  },
  vouchers: {
    title: 'Vouchers',
    subtitle: 'Disbursement (Check) & Journal Vouchers',
    newVoucherButton: 'New Voucher',
    type: {
      checkVoucher: 'Disbursement / Check Voucher',
      journalVoucher: 'Journal Voucher'
    },
    status: {
      posted: 'Posted'
    },
    actions: {
      approve: 'Approve',
      post: 'Post'
    },
    table: {
      number: 'Voucher #',
      type: 'Type',
      payee: 'Payee',
      particulars: 'Particulars',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      empty: 'No vouchers found',
      exportTooltip: 'Export voucher'
    },
    form: {
      voucherType: 'Voucher Type',
      modeOfPayment: 'Mode of Payment',
      modeCash: 'Cash',
      modeCheck: 'Check',
      checkNumber: 'Check Number',
      payee: 'Payee',
      payeePlaceholder: 'Vendor or recipient name',
      payeeAddress: 'Payee Address',
      bankAccount: 'Bank Account (for Credit)',
      bankAccountPlaceholder: 'e.g. DBP #00-500128590-5',
      glAccount: 'GL Account (Debit)',
      glAccountPlaceholder: 'e.g. Telephone and Communications',
      amount: 'Amount',
      particulars: 'Particulars',
      createButton: 'Create Voucher'
    },
    toast: {
      missingFields: 'Payee, account, and amount are required',
      created: 'Voucher created',
      statusChanged: '{{number}} marked as {{status}}',
      excelGenerated: 'Excel file generated in the Council’s official format',
      pdfGenerated: 'PDF file generated',
      wordGenerated: 'Word document generated'
    },
    confirmApprove: {
      title: 'Approve Voucher',
      message: 'Approve voucher {{number}}?'
    },
    confirmPost: {
      title: 'Post Voucher',
      message: 'Post voucher {{number}} to the cash disbursement journal? This cannot be undone.'
    }
  },
  invoices: {
    title: 'Invoices',
    newInvoiceButton: 'New Invoice',
    markAsPaidButton: 'Mark as Paid',
    defaultMemo: 'Thank you for your business.',
    status: {
      sent: 'Sent',
      partial: 'Partial'
    },
    filter: {
      all: 'All'
    },
    summary: {
      overdue: 'Overdue',
      notDueYet: 'Not due yet',
      paid: 'Paid'
    },
    table: {
      number: 'Number',
      customer: 'Customer',
      issueDate: 'Issue Date',
      dueDate: 'Due Date',
      status: 'Status',
      total: 'Total',
      balanceDue: 'Balance Due',
      amount: 'Amount',
      empty: 'No invoices found'
    },
    detail: {
      issued: 'Issued',
      due: 'Due',
      description: 'Description',
      qty: 'Qty',
      rate: 'Rate',
      subtotal: 'Subtotal',
      tax: 'Tax (12%)',
      total: 'Total'
    },
    form: {
      saveAsDraft: 'Save as Draft',
      saveAndSend: 'Save and Send',
      selectCustomer: 'Select customer',
      lineItems: 'Line Items',
      addLine: 'Add Line',
      selectItem: 'Select item'
    },
    toast: {
      customerRequired: 'Please select a customer.',
      dueDateRequired: 'Please set a due date.',
      lineItemRequired: 'Add at least one line item.',
      sent: '{{number}} sent to {{customer}}',
      savedAsDraft: '{{number}} saved as draft',
      markedPaid: '{{number}} marked as paid'
    },
    confirmMarkPaid: {
      title: 'Mark Invoice as Paid',
      message: 'Mark invoice {{number}} ({{amount}}) as fully paid? This cannot be undone.'
    }
  },
  customers: {
    title: 'Customers',
    newCustomerButton: 'New Customer',
    searchPlaceholder: 'Search customers…',
    fields: {
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      status: 'Status',
      openBalance: 'Open Balance'
    },
    table: {
      name: 'Customer',
      empty: 'No customers found'
    },
    detail: {
      totalBilled: 'Total Billed',
      invoices: 'Invoices',
      noInvoices: 'No invoices for this customer yet.'
    },
    form: {
      fullName: 'Full Name',
      fullNamePlaceholder: 'Juan Dela Cruz',
      companyPlaceholder: 'Company name',
      emailPlaceholder: 'name@company.ph',
      phonePlaceholder: '+63 9XX XXX XXXX',
      address: 'Address',
      addressPlaceholder: 'City, Province',
      saveButton: 'Save Customer'
    },
    toast: {
      missingFields: 'Name and email are required.',
      created: '{{name}} added to customers'
    }
  },
  expenses: {
    title: 'Expenses',
    newExpenseButton: 'New Expense',
    summary: {
      total: 'Total Expenses'
    },
    table: {
      date: 'Date',
      vendor: 'Vendor',
      category: 'Category',
      paymentMethod: 'Payment Method',
      amount: 'Amount',
      status: 'Status',
      empty: 'No expenses found'
    },
    form: {
      selectVendor: 'Select vendor',
      saveButton: 'Save Expense'
    },
    toast: {
      vendorRequired: 'Please select a vendor.',
      invalidAmount: 'Enter a valid amount.',
      created: 'Expense of {{amount}} recorded'
    }
  },
  vendors: {
    title: 'Vendors',
    addButton: 'New Vendor',
    modalTitle: 'New Vendor',
    saveButton: 'Save Vendor',
    emptyMessage: 'No vendors found',
    validation: {
      nameEmailRequired: 'Name and email are required.'
    },
    toast: {
      added: '{{name}} added to vendors'
    },
    columns: {
      vendor: 'Vendor',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      category: 'Category',
      balance: 'Balance',
      status: 'Status'
    },
    form: {
      contactName: 'Contact Name',
      contactNamePlaceholder: 'Contact name',
      company: 'Company',
      companyPlaceholder: 'Company name',
      email: 'Email',
      emailPlaceholder: 'name@company.ph',
      phone: 'Phone',
      phonePlaceholder: '+63 9XX XXX XXXX',
      category: 'Category'
    }
  },
  items: {
    title: 'Products & Services',
    addButton: 'New Item',
    modalTitle: 'New Product / Service',
    saveButton: 'Save Item',
    emptyMessage: 'No products or services yet',
    validation: {
      nameSkuRequired: 'Name and SKU are required.'
    },
    toast: {
      added: '{{name}} added to products & services'
    },
    typeBadge: {
      service: 'Service',
      product: 'Product',
      inventory: 'Inventory'
    },
    columns: {
      name: 'Name',
      sku: 'SKU',
      type: 'Type',
      salesPrice: 'Sales Price',
      cost: 'Cost',
      qtyOnHand: 'Qty on Hand',
      incomeAccount: 'Income Account'
    },
    form: {
      name: 'Name',
      namePlaceholder: 'Item name',
      sku: 'SKU',
      skuPlaceholder: 'SKU-000',
      type: 'Type',
      description: 'Description',
      descriptionPlaceholder: 'Short description',
      salesPrice: 'Sales Price',
      cost: 'Cost',
      qtyOnHand: 'Quantity on Hand',
      incomeAccount: 'Income Account'
    }
  },
  reports: {
    title: 'Reports',
    tabs: {
      pnl: 'Profit & Loss',
      balanceSheet: 'Balance Sheet'
    },
    pnl: {
      chartTitle: 'Income vs Expenses',
      chartSubtitle: 'Last 6 months · cash basis',
      cardTitle: 'Profit & Loss',
      cardSubtitle: 'Cash basis · paid invoices and paid expenses',
      income: 'Income',
      expenses: 'Expenses',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      netIncome: 'Net Income',
      exportLabel: 'Export Income Statement',
      toast: {
        excel: 'Income Statement exported to Excel',
        pdf: 'Income Statement exported as PDF',
        word: 'Income Statement exported as Word document'
      }
    },
    balanceSheet: {
      exportLabel: 'Export Balance Sheet',
      assets: 'Assets',
      liabilities: 'Liabilities',
      equity: 'Equity',
      totalAssets: 'Total Assets',
      totalLiabilities: 'Total Liabilities',
      totalLiabilitiesEquity: 'Total Liabilities & Equity',
      toast: {
        excel: 'Balance Sheet exported to Excel',
        pdf: 'Balance Sheet exported as PDF',
        word: 'Balance Sheet exported as Word document'
      }
    }
  },
  scrd: {
    title: 'Cash Receipts & Disbursements',
    tabs: {
      receipts: 'Cash Receipts Journal',
      disbursements: 'Cash Disbursement Journal',
      summary: 'SCRD Summary'
    },
    exportJournalLabel: 'Export Journal',
    exportSummaryLabel: 'Export SCRD',
    emptyReceipts: 'No cash receipts recorded',
    emptyDisbursements: 'No posted/approved disbursement vouchers',
    beginningBalanceLabel: 'Beginning Balance:',
    interestIncomeLabel: 'Interest Income:',
    otherIncomeLabel: 'Other Income:',
    openingBalancesTitle: 'Bank Opening Balances',
    banks: {
      addButton: 'Add Bank',
      addTitle: 'Add Bank Account',
      name: 'Bank Name',
      namePlaceholder: 'e.g. BDO, Cash on Hand',
      accountNumber: 'Account Number',
      accountNumberPlaceholder: 'Optional',
      openingBalance: 'Opening Balance',
      toast: {
        nameRequired: 'Bank name is required',
        added: 'Bank account added'
      }
    },
    columns: {
      date: 'Date',
      payorPayee: 'Payor / Payee',
      particulars: 'Particulars',
      reference: 'Ref #',
      category: 'Category',
      bankAccount: 'Bank Account',
      amount: 'Amount'
    },
    summary: {
      beginningBalance: 'Beginning Balance',
      totalReceipts: 'Total Receipts',
      totalDisbursements: 'Total Disbursements',
      endingBalance: 'Ending Balance',
      receiptsByCategory: 'Receipts by Category',
      disbursementsByCategory: 'Disbursements by Category',
      generalOperations: 'A. General Operations',
      nesSales: 'B. National Equipment Service — Sales',
      rentalIncome: 'II. Rental Income',
      interestIncome: 'III. Interest Income',
      otherIncome: 'IV. Other Income',
      otherIncomeManualEntry: 'Other Income (Manual Entry)',
      operatingExpenses: 'A. Operating Expenses',
      nesPurchases: 'B. National Equipment Services — Purchases',
      capitalOutlay: 'II. Capital Outlay',
      otherExpenses: 'III. Other Expenses',
      accountedForAsFollows: 'Accounted For As Follows',
      account: 'Account',
      opening: 'Opening Balance',
      closing: 'Closing Balance'
    },
    toast: {
      receiptsExcel: 'Cash Receipts Journal exported in the Council’s official format',
      receiptsPdf: 'Cash Receipts Journal exported as PDF',
      receiptsWord: 'Cash Receipts Journal exported as Word document',
      disbursementsExcel: 'Cash Disbursement Journal exported in the Council’s official format',
      disbursementsPdf: 'Cash Disbursement Journal exported as PDF',
      disbursementsWord: 'Cash Disbursement Journal exported as Word document',
      summaryExcel: 'SCRD exported in the Council’s official format',
      summaryPdf: 'SCRD exported as PDF',
      summaryWord: 'SCRD exported as Word document'
    }
  },
  pos: {
    title: 'Point of Sale',
    searchPlaceholder: 'Search product name or SKU…',
    stockLabel: 'Stock: {{count}}',
    noProductsMatch: 'No products match your search.',
    completeSale: 'Complete Sale',
    tabs: {
      register: 'Sell',
      history: 'Sales History'
    },
    history: {
      emptyMessage: 'No sales yet.',
      itemsCount: '{{count}} item(s)',
      printButton: 'Print',
      voidButton: 'Void',
      table: {
        saleNumber: 'Sale #',
        date: 'Date',
        cashier: 'Cashier',
        items: 'Items',
        payment: 'Payment',
        total: 'Total',
        status: 'Status',
        actions: 'Actions'
      },
      status: {
        completed: 'Completed',
        voided: 'Voided'
      },
      voidReasonTooltip: 'Void reason: {{reason}}'
    },
    cart: {
      title: 'Cart ({{count}})',
      empty: 'Cart is empty — scan or click a product to add.',
      noMember: 'No member',
      printReceipt: 'Print receipt',
      subtotal: 'Subtotal',
      discount: 'Discount',
      total: 'Total'
    },
    paymentMethods: {
      cash: 'Cash',
      card: 'Card',
      eWallet: 'E-Wallet'
    },
    toast: {
      codeNotFound: 'No product or member found for code "{{code}}"',
      memberScanned: '{{name}} selected — {{rate}}% discount applied',
      cartEmpty: 'Cart is empty',
      saleCompleted: 'Sale {{saleNumber}} completed — {{amount}}',
      silentPrintFailed:
        "Couldn't print the receipt — check that the receipt printer is connected and configured in Settings",
      saleVoided: 'Sale {{saleNumber}} voided — stock restored',
      voidReasonRequired: 'Please enter a reason for voiding this sale'
    },
    modal: {
      saleCompleteTitle: 'Sale Complete — {{saleNumber}}',
      printReceipt: 'Print Receipt',
      paymentReceivedVia: 'Payment received via {{method}}',
      undoSale: 'Undo Sale',
      undoSaleConfirmTitle: 'Undo this sale?',
      undoSaleConfirmMessage:
        'Sale {{saleNumber}} will be voided and the items returned to stock. This cannot be undone.',
      undoSaleReasonLabel: 'Reason for void/refund',
      undoSaleReasonPlaceholder: 'e.g. Wrong item rung up, customer requested refund…'
    }
  },
  products: {
    title: 'Inventory',
    addButton: 'Add Product',
    searchPlaceholder: 'Search products…',
    lowStockAlert: '{{count}} product(s) at or below reorder level: {{names}}',
    restockButton: 'Restock',
    printLabelButton: 'Print Label',
    export: {
      salesReport: 'Sales Report',
      inventoryReport: 'Inventory Report',
      incomeStatement: 'Income Statement'
    },
    period: {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      quarterEndedPlaceholder: 'e.g. March 31, 2026'
    },
    table: {
      emptyMessage: 'No products found',
      image: 'Image',
      skuBarcode: 'SKU / Barcode',
      product: 'Product',
      category: 'Category',
      cost: 'Cost',
      price: 'Price',
      stock: 'Stock',
      status: 'Status'
    },
    form: {
      image: 'Product Image',
      uploadImage: 'Upload Image',
      skuBarcode: 'SKU / Barcode',
      category: 'Category',
      selectCategory: 'Select a category…',
      description: 'Description',
      unit: 'Unit',
      productName: 'Product Name',
      costPrice: 'Cost Price',
      sellingPrice: 'Selling Price',
      stockQuantity: 'Stock Quantity',
      reorderLevel: 'Reorder Level',
      numberOfLabels: 'Number of labels',
      quantityToAdd: 'Quantity to Add',
      unitCost: 'Unit Cost'
    },
    modal: {
      addProductTitle: 'Add Product',
      editProductTitle: 'Edit Product',
      saveProduct: 'Save Product',
      printLabelsTitle: 'Print Barcode Labels — {{name}}',
      preview: 'Preview',
      print: 'Print',
      restockTitle: 'Restock — {{name}}',
      addStock: 'Add Stock',
      currentStockLabel: 'Current stock:',
      units: 'unit(s)'
    },
    confirmDelete: {
      title: 'Delete Product',
      message:
        'Delete {{name}}? This removes it from inventory permanently. Past sales and purchase records referencing it will not be affected. This cannot be undone.'
    },
    toast: {
      skuNameRequired: 'SKU and name are required',
      duplicateSku: 'A product with this SKU already exists',
      productAdded: '{{name}} added to inventory',
      productUpdated: '{{name}} updated',
      deleted: '{{name}} deleted from inventory',
      invalidQuantity: 'Enter a valid quantity',
      restockSuccess: '{{count}} unit(s) of {{name}} added to stock',
      noSalesToReport: 'No sales recorded yet to report',
      salesReportExportedExcel:
        'NES Monthly Sales Report exported in the Council’s official format',
      salesReportExportedPdf: 'NES Monthly Sales Report exported as PDF',
      salesReportExportedWord: 'NES Monthly Sales Report exported as Word document',
      inventoryReportExportedExcel:
        'NES Monthly Inventory Report exported in the Council’s official format',
      inventoryReportExportedPdf: 'NES Monthly Inventory Report exported as PDF',
      inventoryReportExportedWord: 'NES Monthly Inventory Report exported as Word document',
      incomeStatementExportedExcel: 'NES Income Statement auto-computed and exported',
      incomeStatementExportedPdf: 'NES Income Statement exported as PDF',
      incomeStatementExportedWord: 'NES Income Statement exported as Word document'
    }
  },
  members: {
    title: 'Members',
    addButton: 'Add Member',
    printCardButton: 'Print Loyalty Card',
    table: {
      emptyMessage: 'No members found',
      memberCode: 'Member Code',
      name: 'Name',
      email: 'Email',
      discount: 'Discount'
    },
    form: {
      memberCode: 'Member Code',
      name: 'Name',
      email: 'Email',
      discountRate: 'Discount Rate (%)',
      numberOfCards: 'Number of cards'
    },
    modal: {
      addMemberTitle: 'Add Member',
      editMemberTitle: 'Edit Member',
      saveMember: 'Save Member',
      printCardTitle: 'Loyalty Card — {{name}}',
      preview: 'Preview',
      print: 'Print',
      scanHint: 'This barcode can be scanned at the Point of Sale to apply the member’s discount.'
    },
    card: {
      discountLabel: '{{rate}}% Member Discount'
    },
    confirmDelete: {
      title: 'Delete Member',
      message: 'Delete {{name}}? This cannot be undone.'
    },
    toast: {
      codeNameRequired: 'Member code and name are required',
      memberAdded: '{{name}} added as a member',
      memberUpdated: '{{name}} updated',
      memberDeleted: '{{name}} deleted'
    }
  },
  users: {
    title: 'User Accounts',
    addButton: 'Add User',
    emptyState: 'No user accounts found',
    statusDisabled: 'Disabled',
    disable: 'Disable',
    enable: 'Enable',
    table: {
      fullName: 'Full Name',
      role: 'Role',
      status: 'Status',
      action: 'Action'
    },
    rolePermissions: {
      title: 'Role Permissions',
      subtitle: 'Control which modules each role can see and use.',
      permissionsGranted: '{{granted}} / {{total}} permissions granted',
      editButton: 'Edit Permissions',
      addRole: {
        button: 'Add Role',
        title: 'Add Role',
        nameLabel: 'Role Name',
        namePlaceholder: 'e.g. Front Desk',
        submitButton: 'Add Role',
        note: 'This role can see and do exactly what you grant it below — check the boxes for every module it should access.',
        errors: {
          required: 'Role name is required',
          invalid: 'Role name must contain at least one letter or number',
          duplicate: 'A role with this name already exists'
        }
      },
      deleteRole: {
        confirmTitle: 'Delete Role',
        confirmMessage: 'Delete the "{{role}}" role? This cannot be undone.',
        success: 'Role "{{role}}" deleted',
        inUse: 'Assigned to {{count}} user(s) — reassign them before deleting this role'
      }
    },
    addModal: {
      title: 'Add User Account',
      fullNameLabel: 'Full Name',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      roleLabel: 'Role',
      generateButton: 'Generate Command',
      commandHelp:
        "This app never carries admin credentials, so account changes run from a terminal. Copy this command and run it on a machine with the project's service account key.",
      copyButton: 'Copy Command'
    },
    editModal: {
      titleDefault: 'Edit User',
      titleWithName: 'Edit {{fullName}}',
      generateButton: 'Generate Command',
      roleChangeHint:
        'Changing the role needs a command run from a developer machine — the app never carries admin credentials.'
    },
    permissionsModal: {
      titleDefault: 'Role Permissions',
      titleWithRole: '{{role}} Permissions',
      doneButton: 'Done',
      manage: 'Manage'
    },
    toast: {
      missingFields: 'Full name, email, and password are required',
      fullNameRequired: 'Full name is required',
      userDisabled: 'User "{{fullName}}" disabled',
      userEnabled: 'User "{{fullName}}" enabled',
      toggleActiveFailed: 'Failed to update this account. Please try again.',
      fullNameUpdated: '"{{fullName}}" saved',
      fullNameUpdateFailed: 'Failed to save the name. Please try again.',
      commandCopied: 'Command copied to clipboard',
      commandCopyFailed: 'Failed to copy the command'
    },
    confirmDisable: {
      title: 'Disable User Account',
      message: 'Disable "{{fullName}}"? They will not be able to log in until re-enabled.'
    },
    confirmEnable: {
      title: 'Enable User Account',
      message: 'Enable "{{fullName}}"? They will regain access to log in.'
    }
  },
  auditLog: {
    title: 'Audit Log',
    subtitle: '{{count}} event(s) this session',
    emptyMessage:
      'No activity recorded yet this session — actions across the app will appear here.',
    table: {
      when: 'When',
      actor: 'Actor',
      entity: 'Entity',
      action: 'Action',
      summary: 'Summary'
    }
  },
  goals: {
    title: 'Goals & Objectives',
    programYear: 'Program Year {{year}}',
    exportLabel: 'Export Report',
    goalLabel: 'Goal {{code}}',
    empty: 'No objectives found',
    noGoals: 'No goals yet. Create your first goal to get started.',
    newGoalButton: 'New Goal',
    editGoalButton: 'Edit Goal',
    deleteGoalButton: 'Delete Goal',
    addObjectiveButton: 'Add Objective',
    editObjectiveButton: 'Edit Objective',
    table: {
      code: 'Code',
      objective: 'Objective',
      annualTarget: 'Annual Target',
      thisMonth: '{{month}} Achieved',
      autoTracked: 'Auto-tracked from Sales',
      achievedToDate: 'Achieved to Date',
      percentAchieved: '% Achieved'
    },
    form: {
      goalCode: 'Goal Code',
      goalTitle: 'Goal Title',
      goalTitlePlaceholder: 'e.g. More Opportunities for More Girls',
      objectiveCode: 'Objective Code',
      objectiveCodePlaceholder: 'e.g. 1.a.1',
      objectiveLabel: 'Objective',
      objectiveLabelPlaceholder: 'e.g. Membership — School-based',
      unit: 'Unit',
      unitCount: 'Count',
      unitPeso: 'Peso (₱)',
      unitPercent: 'Percent (%)'
    },
    confirmDeleteGoal: {
      title: 'Delete Goal',
      message:
        'Are you sure you want to delete "{{title}}"? All of its objectives and progress will be permanently removed.'
    },
    confirmDeleteObjective: {
      title: 'Delete Objective',
      message:
        'Are you sure you want to delete "{{label}}"? Its progress history will be permanently removed.'
    },
    toast: {
      exportedExcel: 'Goals & Objectives report exported to Excel',
      exportedPdf: 'Goals & Objectives report exported as PDF',
      exportedWord: 'Goals & Objectives report exported as Word document',
      missingTitle: 'Goal title is required',
      missingObjectiveFields: 'Objective code and label are required',
      goalCreated: 'Goal created',
      goalUpdated: 'Goal updated',
      goalDeleted: 'Goal deleted',
      objectiveCreated: 'Objective added',
      objectiveUpdated: 'Objective updated',
      objectiveDeleted: 'Objective deleted'
    }
  }
} as const

export default en
export type Translations = typeof en
