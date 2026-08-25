const tl = {
  common: {
    signIn: 'Mag-sign In',
    signOut: 'Mag-sign Out',
    loading: 'Naglo-load...',
    error: 'Error',
    save: 'I-save',
    refresh: 'I-refresh',
    cancel: 'Kanselahin',
    confirm: 'Kumpirmahin',
    reset: 'I-reset',
    settings: 'Mga Setting',
    dashboard: 'Dashboard',
    about: 'Tungkol',
    welcome: 'Maligayang pagdating',
    beta: 'Beta',
    add: 'Magdagdag',
    edit: 'I-edit',
    delete: 'Tanggalin',
    view: 'Tingnan',
    close: 'Isara',
    back: 'Bumalik',
    search: 'Maghanap…',
    export: 'I-export',
    columns: 'Mga Column',
    toggleColumns: 'Ipakita/Itago ang Column',
    noRecordsFound: 'Walang nahanap na record',
    showing: 'Ipinapakita',
    of: 'sa',
    page: 'Pahina',
    perPageOption: '{{count}} bawat pahina',
    row: 'row',
    rows: 'rows',
    yes: 'Oo',
    no: 'Hindi',
    actions: 'Mga Aksyon',
    processing: 'Pinoproseso…',
    active: 'Aktibo',
    inactive: 'Hindi Aktibo',
    pending: 'Nakabinbin',
    approved: 'Aprubado',
    rejected: 'Tinanggihan',
    completed: 'Tapos na',
    cancelled: 'Kinansela',
    draft: 'Draft',
    paid: 'Bayad na',
    unpaid: 'Hindi pa Bayad',
    overdue: 'Lagpas na sa Deadline'
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
    collapseSidebar: 'I-collapse ang sidebar',
    expandSidebar: 'I-expand ang sidebar',
    guest: 'Bisita',
    myProfile: 'Aking Profile',
    groups: {
      goals: 'Mga Layunin at Tunguhin',
      hrPayroll: 'HR at Payroll',
      facility: 'Facility',
      accounting: 'Accounting',
      admin: 'Admin'
    },
    nav: {
      dashboard: 'Dashboard',
      pos: 'Point of Sale',
      products: 'Inventory',
      members: 'Mga Miyembro',
      employees: 'Mga Empleyado',
      troops: 'Mga Troop',
      attendance: 'Attendance',
      leave: 'Mga Leave Request',
      payroll: 'Payroll',
      orgChart: 'Organizational Chart',
      vouchers: 'Mga Voucher',
      rentals: 'Mga Rental Booking',
      invoices: 'Mga Invoice',
      customers: 'Mga Customer',
      expenses: 'Mga Gastos',
      vendors: 'Mga Vendor',
      items: 'Mga Produkto at Serbisyo',
      reports: 'Mga Ulat',
      scrd: 'Cash Receipts & Disb.',
      users: 'Mga User Account',
      auditLog: 'Audit Log',
      settings: 'Mga Setting',
      devices: 'Mga Device',
      about: 'Tungkol',
      enrollment: 'Pag-enroll',
      goals: 'Mga Layunin at Tunguhin'
    }
  },
  titleBar: {
    minimize: 'I-minimize',
    maximize: 'I-maximize',
    close: 'Isara',
    switchToLight: 'Lumipat sa maliwanag na mode',
    switchToDark: 'Lumipat sa madilim na mode',
    searchShortcut: 'Maghanap (Ctrl+K)',
    searchPlaceholder: 'Maghanap…',
    esc: 'Esc',
    notifications: 'Mga Notipikasyon',
    clearAll: 'I-clear lahat',
    noNotifications: 'Walang notipikasyon',
    home: 'Home'
  },
  auth: {
    welcomeBack: 'Maligayang pagbabalik',
    signInSubtitle: 'Mag-sign in para magpatuloy',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'Ilagay ang iyong email address',
    passwordPlaceholder: 'Ilagay ang iyong password',
    demo: 'Makipag-ugnayan sa iyong administrator kung wala ka pang account.',
    emailRequired: 'Kailangan ng valid na email address.',
    passwordMinLength: 'Ang password ay dapat hindi bababa sa 6 na character.',
    errors: {
      invalidCredentials: 'Maling email o password.',
      userDisabled: 'Naka-disable ang account na ito. Makipag-ugnayan sa iyong administrator.',
      tooManyRequests: 'Sobrang dami ng pagtatangka. Maghintay saglit at subukan muli.',
      network: 'May problema sa network — tingnan ang iyong koneksyon at subukan muli.',
      generic: 'Hindi matagumpay ang pag-sign in. Subukan muli.'
    }
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Ganito ang kalagayan ng iyong negosyo.',
    refreshButton: 'I-refresh',
    refreshToast: 'Na-refresh na ang data',
    newExpenseButton: 'Bagong Gastos',
    newInvoiceButton: 'Bagong Invoice',
    statCashBalance: 'Kabuuang Cash & Bank Balance',
    cashBalanceNote: 'Sa {{count}} bank account',
    bankBalancesTitle: 'Mga Balanse ng Bangko',
    statIncome: 'Kita (bayad na)',
    statExpenses: 'Mga Gastos',
    statNetProfit: 'Netong Kita',
    statOutstandingInvoices: 'Mga Outstanding Invoice',
    vsLastPeriod: 'kumpara sa nakaraang panahon',
    outstandingNote: '{{count}} invoice ang naghihintay ng bayad',
    cashFlowTitle: 'Halagang In-invoice sa Paglipas ng Panahon',
    cashFlowSubtitle: 'Huling ~120 araw, bawat 15-araw na panahon',
    invoicedSeriesName: 'In-invoice',
    invoicesTitle: 'Mga Invoice',
    overdueBadge: 'Lagpas na sa Deadline',
    notDueYetBadge: 'Hindi pa Due',
    expensesByCategoryTitle: 'Mga Gastos ayon sa Kategorya',
    noExpensesRecorded: 'Wala pang naitalang gastos.',
    lowStockLabel: 'Mababa ang Stock',
    lowStockExample: 'hal. {{name}}',
    lowStockAllStocked: 'Sapat ang stock ng lahat ng item',
    attendanceLabel: 'Attendance Ngayong Araw',
    attendanceDetail: '{{onLeave}} nasa leave · {{absent}} absent',
    pendingLeaveLabel: 'Mga Nakabinbing Leave Request',
    pendingLeaveNeedsReview: 'Kailangan ng review',
    pendingLeaveAllCaughtUp: 'Wala nang naghihintay',
    recentActivityTitle: 'Kamakailang Aktibidad',
    viewAll: 'Tingnan lahat'
  },
  settings: {
    title: 'Mga Setting',
    subtitle: 'I-customize ang iyong karanasan sa GSPI Admin.',
    appearance: 'Hitsura',
    appearanceDesc: 'I-customize ang hitsura at pakiramdam',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Lumipat sa pagitan ng madilim at maliwanag na interface',
    accentColor: 'Accent Color',
    accentColorDesc: 'Piliin ang iyong pangunahing kulay ng interface',
    fontSize: 'Laki ng Font',
    fontSizeDesc: 'Ayusin ang laki ng base font para sa kakayahang mabasa',
    compactMode: 'Compact Mode',
    compactModeDesc: 'Bawasan ang espasyo para sa mas siksik na display ng impormasyon',
    language: 'Wika',
    notifications: 'Mga Notipikasyon',
    notificationsDesc: 'Kontrolin ang mga notipikasyong natatanggap mo',
    enableNotifications: 'Paganahin ang Mga Notipikasyon',
    enableNotificationsDesc:
      'Magpakita ng mga notipikasyon ng system para sa mahahalagang kaganapan',
    soundAlerts: 'Mga Sound Alert',
    soundAlertsDesc: 'Mag-play ng tunog kapag dumating ang mga notipikasyon',
    updateNotifications: 'Mga Update na Notipikasyon',
    updateNotificationsDesc: 'Ipaalam kapag may bagong bersyon',
    securityAlerts: 'Mga Security Alert',
    securityAlertsDesc: 'Mag-alerto sa kahina-hinalang aktibidad',
    marketingEmails: 'Mga Marketing Email',
    marketingEmailsDesc: 'Tumanggap ng mga update ng produkto at anunsyo',
    security: {
      title: 'Seguridad',
      description: 'Baguhin ang password ng iyong account',
      currentPasswordLabel: 'Kasalukuyang Password',
      newPasswordLabel: 'Bagong Password',
      confirmPasswordLabel: 'Kumpirmahin ang Bagong Password',
      updateButton: 'I-update ang Password',
      toast: {
        updated: 'Matagumpay na na-update ang password'
      },
      errors: {
        wrongCurrentPassword: 'Mali ang kasalukuyang password.',
        weakPassword:
          'Masyadong mahina ang bagong password — gumamit ng hindi bababa sa 6 na character.',
        requiresRecentLogin: 'Mag-sign out at mag-sign in muli, pagkatapos ay subukan ulit.',
        mismatch: 'Hindi magkatugma ang bagong password at kumpirmasyon.',
        generic: 'Hindi na-update ang password. Subukan muli.'
      }
    },
    barcodeScanner: {
      title: 'Barcode Scanner',
      description:
        'Ikonekta ang USB o Bluetooth barcode scanner para sa mabilis na paghahanap sa Point of Sale.',
      status: {
        idle: 'Hindi pa na-te-test',
        detected: 'Nadetect ang scanner'
      },
      usbTitle: 'USB (wired o wireless dongle)',
      usbStep1: 'I-plug ang scanner, o ang USB receiver nito, sa isang USB port.',
      usbStep2:
        'Awtomatikong made-detect ito ni Windows bilang keyboard — walang kailangang driver sa karamihan ng models.',
      usbStep3: 'I-scan ang barcode ng isang produkto sa ibaba para ma-confirm na gumagana ito.',
      bluetoothTitle: 'Bluetooth',
      bluetoothStep1: 'Buksan ang Windows Settings → Bluetooth & devices → Add device.',
      bluetoothStep2:
        'Ilagay ang scanner sa pairing mode (pindutin nang matagal ang pairing button, o i-scan ang "pairing" barcode sa manual nito).',
      bluetoothStep3: 'Piliin ang scanner sa listahan at i-pair.',
      bluetoothStep4:
        'I-scan ang barcode ng isang produkto sa ibaba para ma-confirm na gumagana ito.',
      openBluetoothSettings: 'Buksan ang Bluetooth Settings',
      testTitle: 'I-test ang iyong scanner',
      testHint:
        'I-scan ang kahit anong barcode — lalabas ang resulta sa ibaba. Gumagana ito kahit saan sa page na ito maliban kapag nagta-type sa isang text field.',
      waiting: 'Naghihintay ng scan…',
      lastScanLabel: 'Huling scan',
      clearButton: 'I-clear',
      posNote: 'Sa Point of Sale, itinutugma ang na-scan na code sa SKU ng bawat produkto.'
    },
    biometricDevice: {
      title: 'Biometric Terminal',
      description:
        'Ikonekta ang Hikvision face recognition terminal para sa real-time na attendance',
      hostLabel: 'IP Address',
      portLabel: 'Port',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      passwordSavedPlaceholder: 'Naka-save — iwanang blangko para hindi baguhin',
      useHttpsLabel: 'Gumagamit ng HTTPS ang device',
      testButton: 'I-test ang Koneksyon',
      connectButton: 'Kumonekta',
      disconnectButton: 'Idiskonekta',
      status: {
        disconnected: 'Naka-disconnect',
        connecting: 'Kumokonekta…',
        connected: 'Nakakonekta',
        error: 'May Error'
      },
      toast: {
        hostRequired: 'Kailangan ang IP address ng device',
        saved: 'Na-save ang settings ng device',
        testFailed: 'Nabigo ang connection test',
        connectFailed: 'Hindi nakakonekta sa device',
        saveFailed: 'Hindi na-save ang settings ng device',
        apiUnavailable:
          'Kailangan i-restart nang buo ang app para gumana ito — isara at buksan muli ang GSPI Admin, subukan ulit.'
      }
    },
    receiptPrinter: {
      title: 'Receipt Printer at Cash Drawer',
      description:
        'I-print nang tahimik ang resibo sa checkout, walang OS print dialog, papunta sa receipt printer na naka-install sa Windows.',
      printerLabel: 'Printer',
      systemDefault: 'System default na printer',
      default: 'Default',
      autoPrintLabel: 'I-auto-print ang resibo pagkatapos ng benta',
      autoPrintDesc:
        'Kapag naka-on, awtomatikong mag-p-print ang resibo pagkatapos ng bawat kumpletong benta. Pwede pa rin itong i-off ng cashier per-sale mula sa Point of Sale screen.',
      testButton: 'Magpadala ng Test Print',
      testSuccess: 'Naipadala ang test receipt sa printer',
      testFailure: 'Nabigo ang test print: {{error}}',
      drawerNote:
        'Tip sa cash drawer: kung naka-wire ang drawer mo sa RJ11/RJ12 port ng printer na ito, i-enable ang "Open cash drawer when printing" (tinatawag din na "kick drawer") sa Windows driver ng printer — Devices & Printers → right-click sa printer → Printer properties → Device settings. Kapag naka-on na iyon, bubukas na rin ang drawer sa tuwing may naka-print na resibo.'
    },
    membershipYear: {
      title: 'Membership Year',
      description:
        'Ang buwan kung saan nagsisimula ang taunang membership cycle ng Girl Scout — dito nakabatay ang renewal ng bawat troop at miyembro.',
      startMonthLabel: 'Nagsisimula ang cycle sa',
      currentCycle: 'Kasalukuyang cycle: {{year}}',
      adminOnlyNote:
        'Super Admin at Admin lang ang makakapagbago nito — apektado ang buong council, sa lahat ng device.',
      months: [
        'Enero',
        'Pebrero',
        'Marso',
        'Abril',
        'Mayo',
        'Hunyo',
        'Hulyo',
        'Agosto',
        'Setyembre',
        'Oktubre',
        'Nobyembre',
        'Disyembre'
      ],
      toast: {
        saved: 'Na-update ang membership year cycle'
      }
    },
    privacy: 'Privacy',
    privacyDesc: 'Pamahalaan ang iyong data at mga kagustuhan sa privacy',
    dataCollection: 'Usage Analytics',
    dataCollectionDesc:
      'Tulungan na mapabuti ang GSPI Admin sa pamamagitan ng pagbabahagi ng anonymized na data',
    crashReports: 'Mga Crash Report',
    crashReportsDesc:
      'Awtomatikong magpadala ng mga crash report para makatulong sa pag-aayos ng mga bug',
    telemetry: 'Telemetry',
    telemetryDesc: 'Ibahagi ang mga sukatan ng pagganap sa team',
    advanced: 'Advanced',
    advancedDesc: 'Mga setting ng developer at maintenance',
    resetSettings: 'I-reset ang mga Setting',
    resetSettingsDesc: 'I-reset ang lahat ng setting sa mga default na halaga',
    resetConfirmTitle: 'I-reset ang mga Setting',
    resetConfirmDesc:
      'Ire-reset nito ang lahat ng setting sa kanilang mga default. Hindi maaaring i-undo ang aksyong ito.',
    dark: 'Madilim',
    light: 'Maliwanag'
  },
  devices: {
    title: 'Mga Device',
    subtitle: 'Ikonekta at i-test ang mga hardware na ginagamit ng GSPI Admin.'
  },
  profile: {
    title: 'Aking Profile',
    subtitle: 'Detalye at larawan ng iyong account.',
    changePhoto: 'Palitan ang larawan',
    toast: {
      photoUpdated: 'Na-update ang larawan',
      photoFailed: 'Nabigo ang pag-upload ng larawan'
    }
  },
  about: {
    tagline:
      'Sistema ng Pamamahala sa Negosyo, HR, at Pananalapi para sa Girl Scouts of the Philippines — Ilocos Sur Council.',
    techStackHeading: 'Tech Stack',
    buildInfoHeading: 'Impormasyon ng Build',
    buildToolLabel: 'Build Tool',
    nodeTargetLabel: 'Node Target',
    rendererTargetLabel: 'Renderer Target',
    architectureLabel: 'Arkitektura',
    licenseLabel: 'Lisensya',
    footerCredits: 'Ginawa gamit ang electron-vite · React 19 · TypeScript · Tailwind CSS',
    footerDevelopedBy: 'Dinebelop ng AionX IT Solutions para sa GSP Ilocos Sur Council.'
  },
  updates: {
    checking: 'Sinusuri ang mga update...',
    available: 'Available ang update',
    notAvailable: 'Updated na ang iyong app',
    downloading: 'Dina-download ang update...',
    downloaded: 'Na-download na ang update',
    readyToInstall: 'I-restart para i-install ang update',
    error: 'Error sa update',
    installNow: 'I-install Ngayon'
  },
  employees: {
    title: 'Pamamahala ng Empleyado',
    addButton: 'Magdagdag ng Empleyado',
    searchPlaceholder: 'Maghanap ng empleyado…',
    empty: 'Walang nahanap na empleyado',
    table: {
      employeeNumber: 'Employee #',
      name: 'Pangalan',
      position: 'Posisyon',
      department: 'Departamento',
      branch: 'Sangay',
      salary: 'Sahod',
      status: 'Katayuan',
      deactivate: 'I-deactivate',
      reactivate: 'I-reactivate'
    },
    modal: {
      addTitle: 'Magdagdag ng Empleyado',
      editTitle: 'I-edit ang Empleyado',
      saveChanges: 'I-save ang mga Pagbabago'
    },
    form: {
      employeeNumber: 'Employee #',
      hireDate: 'Petsa ng Pagkuha',
      fullName: 'Buong Pangalan',
      position: 'Posisyon',
      department: 'Departamento',
      branch: 'Sangay',
      reportsTo: 'Nag-uulat Kay (Reports To)',
      noManager: 'Walang manager (pinakatuktok ng chart)',
      linkedUser: 'Naka-link na User Account',
      noLinkedUser: 'Walang naka-link na account',
      salary: 'Buwanang Sahod',
      email: 'Email',
      phone: 'Telepono',
      payrollDefaultsHeading:
        'Default na Halaga sa Payroll (awtomatikong ilalagay sa bagong Payroll Entry)',
      defaultCola: 'COLA',
      defaultRepresentation: 'Representation',
      defaultSss: 'SSS',
      defaultPhilhealth: 'PhilHealth',
      defaultPagibig: 'Pag-IBIG',
      defaultWithholdingTax: 'Withholding Tax'
    },
    toast: {
      validationRequired: 'Kailangan ang Employee #, pangalan, at posisyon',
      updated: 'Na-update ang empleyado',
      created: '{{name}} ay naidagdag sa mga empleyado',
      deactivated: '{{name}} ay na-deactivate',
      reactivated: '{{name}} ay na-reactivate',
      deleted: '{{name}} ay natanggal'
    },
    confirmDeactivate: {
      title: 'I-deactivate ang Empleyado',
      message:
        'I-deactivate si {{name}}? Sila ay hindi na lalabas sa mga listahan ng aktibong empleyado na ginagamit sa Attendance at Payroll.'
    },
    confirmReactivate: {
      title: 'I-reactivate ang Empleyado',
      message: 'I-reactivate si {{name}}?'
    },
    confirmDelete: {
      title: 'Tanggalin ang Empleyado',
      message:
        'Tanggalin si {{name}}? Permanenteng mabubura ang kanilang employee record. Ang mga umiiral na attendance, leave, at payroll record na naka-link sa kanila ay hindi matatanggal. Hindi na ito maibabalik.'
    },
    profile: {
      viewProfile: 'Tingnan ang Profile',
      changePhoto: 'Palitan ang larawan',
      uploadingPhoto: 'Ina-upload…',
      removePhoto: 'Alisin ang larawan',
      documentsHeading: 'Mga Dokumento',
      noDocuments: 'Wala pang na-upload na dokumento',
      documentLabelPlaceholder: 'Label (opsyonal — default sa pangalan ng file)',
      chooseFiles: 'Pumili ng mga file',
      uploadButton: 'I-upload',
      viewDocument: 'Tingnan',
      downloadDocument: 'I-download',
      documentTypes: {
        resume: 'Resume',
        transcript: 'Transcript / Grado',
        certification: 'Certification',
        other: 'Iba pa'
      },
      confirmDeleteDocument: {
        title: 'Burahin ang Dokumento',
        message: 'Burahin ang dokumentong ito? Hindi na ito maibabalik.'
      },
      confirmDeletePhoto: {
        title: 'Alisin ang Larawan',
        message: 'Alisin ang larawan ng empleyadong ito? Hindi na ito maibabalik.'
      },
      toast: {
        photoUpdated: 'Na-update ang larawan',
        photoFailed: 'Nabigo ang pag-upload ng larawan',
        photoRemoved: 'Naalis ang larawan',
        photoRemoveFailed: 'Nabigo ang pag-alis ng larawan',
        documentUploaded: 'Na-upload ang dokumento',
        documentFailed: 'Nabigo ang pag-upload ng dokumento',
        documentDeleted: 'Nabura ang dokumento',
        documentDownloadFailed: 'Nabigo ang pag-download ng dokumento'
      }
    }
  },
  troops: {
    title: 'Mga Troop at Membership',
    subtitle: 'Membership year {{year}}',
    addButton: 'Magdagdag ng Troop',
    searchPlaceholder: 'Maghanap ng troop…',
    empty: 'Walang nahanap na troop',
    viewRoster: 'Tingnan ang Roster',
    table: {
      troopNumber: 'Troop #',
      troopName: 'Pangalan ng Troop',
      level: 'Level',
      leaderName: 'Troop Leader',
      members: 'Miyembro',
      needsRenewal: '{{count}} kailangang mag-renew',
      status: 'Katayuan',
      deactivate: 'I-deactivate',
      reactivate: 'I-reactivate'
    },
    modal: {
      addTitle: 'Magdagdag ng Troop',
      editTitle: 'I-edit ang Troop',
      saveChanges: 'I-save ang mga Pagbabago'
    },
    form: {
      troopNumber: 'Troop #',
      level: 'Level',
      levelPlaceholder: 'hal. Star Scout, Junior, Cadette, Senior, Ambassador',
      troopName: 'Pangalan ng Troop',
      leaderName: 'Troop Leader',
      assistantLeaderName: 'Assistant Troop Leader',
      school: 'Paaralan / Komunidad',
      barangay: 'Barangay',
      meetingPlace: 'Lugar ng Pagpupulong'
    },
    confirmDeactivate: {
      title: 'I-deactivate ang Troop',
      message:
        'I-deactivate ang Troop {{troopNumber}}? Maitatago ito sa active troop pickers. Hindi ito makakaapekto sa mga miyembro nito.'
    },
    confirmReactivate: {
      title: 'I-reactivate ang Troop',
      message: 'I-reactivate ang Troop {{troopNumber}}?'
    },
    confirmDelete: {
      title: 'Burahin ang Troop',
      message:
        'Burahin ang Troop {{troopNumber}}? Permanenteng mabubura rin ang lahat ng miyembro sa roster nito. Hindi na ito maibabalik.'
    },
    toast: {
      validationRequired: 'Kailangan ang Troop #, level, at troop leader',
      created: 'Naidagdag ang Troop {{troopNumber}}',
      updated: 'Na-update ang Troop',
      deleted: 'Nabura ang Troop {{troopNumber}}',
      deactivated: 'Na-deactivate ang Troop {{troopNumber}}',
      reactivated: 'Na-reactivate ang Troop {{troopNumber}}'
    },
    roster: {
      heading: 'Member Roster',
      addButton: 'Magdagdag ng Miyembro',
      empty: 'Wala pang nakarehistrong miyembro sa troop na ito',
      renewButton: 'I-renew para sa membership year na ito',
      table: {
        fullName: 'Pangalan',
        birthdate: 'Petsa ng Kapanganakan',
        level: 'Level',
        guardian: 'Guardian',
        membership: 'Membership',
        current: 'Kasalukuyan — {{year}}',
        needsRenewalBadge: 'Kailangan i-renew — huling {{year}}'
      },
      modal: {
        addTitle: 'Magdagdag ng Miyembro',
        editTitle: 'I-edit ang Miyembro'
      },
      form: {
        fullName: 'Buong Pangalan',
        birthdate: 'Petsa ng Kapanganakan',
        level: 'Level',
        guardianName: 'Pangalan ng Guardian',
        guardianContact: 'Contact ng Guardian',
        address: 'Address'
      },
      confirmDeactivate: {
        title: 'I-deactivate ang Miyembro',
        message: 'I-deactivate si {{name}}? Maitatago sila sa active roster at renewal tracking.'
      },
      confirmReactivate: {
        title: 'I-reactivate ang Miyembro',
        message: 'I-reactivate si {{name}}?'
      },
      confirmDelete: {
        title: 'Burahin ang Miyembro',
        message: 'Burahin si {{name}} mula sa troop na ito? Hindi na ito maibabalik.'
      },
      toast: {
        validationRequired: 'Kailangan ang buong pangalan at petsa ng kapanganakan',
        created: 'Naidagdag si {{name}} sa roster',
        updated: 'Na-update ang miyembro',
        deleted: 'Naalis si {{name}} sa roster',
        deactivated: 'Na-deactivate si {{name}}',
        reactivated: 'Na-reactivate si {{name}}',
        renewed: 'Na-renew si {{name}} para sa membership year {{year}}'
      }
    }
  },
  attendance: {
    title: 'Pagdalo',
    enrollmentButton: 'Pag-enroll',
    manualEntryButton: 'Manwal na Entry',
    empty: 'Walang tala ng pagdalo para sa saklaw na ito',
    summary: {
      records: 'Mga Tala',
      present: 'Pumasok',
      late: 'Huli',
      overtime: 'Overtime',
      overtimeHours: '{{hours}}h',
      overtimeRecords: '{{count}} tala',
      onLeave: 'Naka-leave',
      absent: 'Lumiban'
    },
    filters: {
      to: 'hanggang',
      allEmployees: 'Lahat ng empleyado'
    },
    table: {
      date: 'Petsa',
      employee: 'Empleyado',
      clockIn: 'Time In',
      clockOut: 'Time Out',
      hours: 'Oras',
      status: 'Katayuan',
      notes: 'Tala',
      action: 'Aksyon'
    },
    status: {
      present: 'Pumasok',
      late: 'Huli',
      'half-day': 'Kalahating Araw',
      absent: 'Lumiban',
      leave: 'Naka-leave',
      overtime: 'Overtime'
    },
    modal: {
      title: 'Manwal na Entry ng Pagdalo'
    },
    form: {
      selectEmployee: 'Pumili ng empleyado'
    },
    toast: {
      selectEmployee: 'Pumili ng empleyado',
      recorded: 'Naitala ang pagdalo',
      deleted: 'Nabura ang tala ng pagdalo'
    },
    confirmDelete: {
      title: 'Burahin ang Tala ng Pagdalo',
      message: 'Burahin ang tala ng pagdalo ni {{name}} noong {{date}}? Hindi na ito maibabalik.'
    }
  },
  leave: {
    title: 'Pamamahala ng Leave',
    fileLeaveButton: 'Mag-file ng Leave',
    approveButton: 'Aprubahan',
    rejectButton: 'Tanggihan',
    revertButton: 'Ibalik sa Tinanggihan',
    empty: 'Wala pang na-file na leave request',
    previewDaysPrefix: 'Ang kahilingang ito ay sasaklaw ng',
    previewDaysSuffix: 'araw.',
    balances: {
      title: 'Balanse ng Leave',
      days: 'araw'
    },
    balancesModal: {
      editButton: 'I-edit ang Balanse',
      title: 'I-edit ang Balanse ng Leave',
      description:
        'Itakda ang taunang credit para sa bawat uri ng leave. Ang Compensatory Time Off ay galing sa overtime kaya hindi ito ma-eedit dito.',
      saved: 'Na-update ang balanse ng leave'
    },
    confirmRevert: {
      title: 'Ibalik ang Pag-apruba',
      reasonPlaceholder: 'hal. Naipasa nang mali'
    },
    confirmDeleteRequest: {
      title: 'Burahin ang Leave Request',
      message: 'Burahin ang {{leaveType}} request ni {{name}}? Hindi na ito maibabalik.'
    },
    table: {
      employee: 'Empleyado',
      leaveType: 'Uri ng Leave',
      from: 'Mula',
      to: 'Hanggang',
      days: 'Araw',
      reason: 'Dahilan',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    modal: {
      fileTitle: 'Mag-file ng Leave Request',
      submit: 'Isumite',
      approveTitle: 'Aprubahan ang Leave Request',
      rejectTitle: 'Tanggihan ang Leave Request',
      confirmApproval: 'Kumpirmahin ang Pag-apruba',
      confirmRejection: 'Kumpirmahin ang Pagtanggi',
      summary: '{{employee}} — {{leaveType}} ({{start}} hanggang {{end}}, {{days}} na araw)'
    },
    form: {
      selectEmployee: 'Pumili ng empleyado',
      selectLeaveType: 'Pumili ng uri ng leave',
      startDate: 'Petsa ng Simula',
      endDate: 'Petsa ng Katapusan',
      halfDay: 'Kalahating araw (0.5 day)',
      notesOptional: 'Tala (opsyonal)',
      notesPlaceholder: 'hal. Medical certificate na nakalagak'
    },
    toast: {
      validationRequired: 'Kailangan ang empleyado at uri ng leave',
      endDateInvalid: 'Ang petsa ng katapusan ay dapat kasabay o pagkatapos ng petsa ng simula',
      insufficientBalance:
        'Kulang ang balanse ng {{leaveType}} — {{remaining}} araw na lang ang natitira, {{days}} ang hiniling',
      filed: 'Na-file ang leave request',
      decided: 'Ang leave request ay {{status}}',
      approvedSynced: 'Ang mga naaprubahang petsa ay na-sync sa Attendance bilang "leave"',
      reverted: 'Naibalik ang pag-apruba sa tinanggihan',
      requestDeleted: 'Nabura ang leave request'
    }
  },
  payroll: {
    title: 'Payroll',
    exportButton: 'I-export ang Register',
    newEntryButton: 'Bagong Payroll Entry',
    pullFromAttendance: 'Kunin mula sa Attendance at Leave',
    approveButton: 'Aprubahan',
    markPaidButton: 'Markahan bilang Bayad',
    empty: 'Wala pang payroll entry',
    summary: {
      totalNet: 'Kabuuang Net Payroll',
      pending: 'Nakabinbin',
      paid: 'Bayad na'
    },
    filters: {
      allYears: 'Lahat ng taon',
      allPeriods: 'Lahat ng period'
    },
    table: {
      payrollNumber: 'Payroll #',
      employee: 'Empleyado',
      period: 'Panahon',
      basic: 'Basic',
      representation: 'Representation',
      unpaidLeave: 'Unpaid Leave',
      deductions: 'Mga Kaltas',
      netPay: 'Net Pay',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    modal: {
      title: 'Bagong Payroll Entry',
      createEntry: 'Gumawa ng Entry'
    },
    form: {
      selectEmployee: 'Pumili ng empleyado',
      periodStart: 'Simula ng Panahon',
      periodEnd: 'Katapusan ng Panahon',
      basicSalary: 'Batayang Sweldo',
      monthlySalaryReference: 'Buwanang Sahod: {{amount}}',
      daysWorked: 'Mga Araw na Trinabaho',
      overtimePay: 'Bayad sa Overtime',
      cola: 'COLA',
      representation: 'Representation',
      sss: 'SSS',
      philhealth: 'PhilHealth',
      pagibig: 'Pag-IBIG',
      withholdingTax: 'Withholding Tax',
      unpaidLeaveDays: 'Mga Araw ng Unpaid Leave'
    },
    preview: {
      basicPay: 'Batayang sahod (araw-araw na rate × araw na trinabaho)',
      unpaidLeaveDeduction: 'Kaltas sa unpaid leave',
      totalDeductions: 'Kabuuang kaltas',
      netPay: 'Net Pay'
    },
    toast: {
      selectEmployeePeriod: 'Piliin muna ang empleyado at panahon',
      attendanceSummary:
        'Pagdalo: {{present}} pumasok, {{absent}} lumiban, {{leave}} nasa leave, {{unpaid}} araw na unpaid leave (≈{{deduction}} na kaltas)',
      selectEmployee: 'Pumili ng empleyado',
      entryCreated: 'Nagawa ang payroll entry',
      noEntriesToExport: 'Walang payroll entry na ie-export',
      exportedExcel: 'Na-export ang payroll register sa opisyal na format ng Council',
      exportedPdf: 'Na-export ang payroll register bilang PDF',
      exportedWord: 'Na-export ang payroll register bilang Word document',
      statusUpdated: 'Ang Payroll {{number}} ay minarkahan bilang {{status}}'
    },
    confirmApprove: {
      title: 'Aprubahan ang Payroll',
      message: 'Aprubahan ang payroll entry {{number}} na {{amount}}?'
    },
    confirmMarkPaid: {
      title: 'Markahan ang Payroll bilang Bayad',
      message:
        'Markahan ang payroll entry {{number}} ({{amount}}) bilang bayad na? Hindi na ito maaaring bawiin.'
    }
  },
  orgChart: {
    title: 'Organizational Chart',
    subtitle:
      '{{count}} aktibong empleyado — i-click ang kahit sino para buksan ang kanilang profile',
    empty:
      'Wala pang aktibong empleyado — magdagdag ng empleyado at itakda kung sino ang kanilang sinasagutan sa Employee form.',
    directReportsCount: '{{count}} direct report',
    editLayout: 'I-edit ang Layout',
    doneEditing: 'Tapos na',
    editHint:
      'I-drag ang card ng isang empleyado papunta sa iba para baguhin kung kanino sila nag-uulat.',
    unassignDropZone: 'I-drop dito para tanggalin ang reporting manager'
  },
  biometricKiosk: {
    title: 'Biometric Enrollment',
    subtitle: 'Pamahalaan kung aling mga empleyado ang naka-enroll para sa biometric attendance',
    backButton: 'Bumalik sa Attendance',
    enrolledEmployees: 'Mga Naka-enroll na Empleyado',
    unenrollButton: 'I-unenroll',
    enrollButton: 'I-enroll',
    empty: 'Walang nahanap na empleyado',
    table: {
      employee: 'Empleyado',
      position: 'Posisyon',
      method: 'Paraan',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    status: {
      enrolled: 'Naka-enroll',
      notEnrolled: 'Hindi Naka-enroll'
    },
    modal: {
      enrollTitle: 'I-enroll si {{name}}',
      note: 'Sinasagawa nito ang pagkuha ng biometric template ng empleyado sa isang enrollment device.',
      methodOptions: {
        fingerprintOnly: 'Fingerprint lang',
        faceOnly: 'Face recognition lang',
        both: 'Fingerprint + Face'
      },
      deviceEnrollLabel: 'I-register din sa terminal (optional)',
      deviceEnrollNote:
        'Mag-upload ng malinaw na front-facing na litrato para ma-register ang mukha ng empleyadong ito sa nakakonektang terminal.',
      deviceNotConnected:
        'Hindi nakakonekta ang terminal — ikonekta ito sa Settings para makapag-enroll din doon.'
    },
    toast: {
      unenrolled: '{{name}} ay na-unenroll',
      enrolled: '{{name}} ay na-enroll para sa biometric attendance',
      deviceEnrolled: 'Na-register ang mukha ni {{name}} sa terminal',
      deviceEnrollFailed: 'Hindi na-register ang mukha sa terminal'
    },
    confirmUnenroll: {
      title: 'I-unenroll ang Empleyado',
      message:
        "I-unenroll si {{name}} sa biometric attendance? Hindi sila makaka-clock in/out sa terminal hangga't hindi ulit na-enroll."
    }
  },
  rentals: {
    title: 'Pamamahala ng Facility at Rental',
    newBookingButton: 'Bagong Booking',
    addSpaceButton: 'Magdagdag ng Room',
    perDay: '/araw',
    capacity: 'Kapasidad',
    bookingsTitle: 'Mga Booking',
    empty: 'Wala pang booking',
    noSpaces: 'Wala pang room o espasyo — i-click ang "Magdagdag ng Room" para gumawa.',
    confirmButton: 'Kumpirmahin',
    markCompletedButton: 'Markahan bilang Tapos',
    table: {
      space: 'Espasyo',
      date: 'Petsa',
      renter: 'Umuupa / Layunin',
      amount: 'Halaga',
      payment: 'Bayad',
      status: 'Katayuan',
      action: 'Aksyon'
    },
    status: {
      reserved: 'Nakareserba',
      confirmed: 'Nakumpirma'
    },
    payment: {
      unpaid: 'Walang Bayad',
      downPayment: 'May Down Payment',
      fullyPaid: 'Bayad na Lahat'
    },
    modal: {
      title: 'Bagong Booking',
      editTitle: 'I-edit ang Booking',
      bookButton: 'I-book ang Espasyo',
      addSpaceTitle: 'Magdagdag ng Room / Espasyo',
      editSpaceTitle: 'I-edit ang Room / Espasyo',
      saveSpace: 'I-save ang Room'
    },
    form: {
      space: 'Espasyo',
      selectSpace: 'Pumili ng espasyo',
      bookingDate: 'Petsa ng Booking',
      startTime: 'Oras ng Simula',
      endTime: 'Oras ng Tapos',
      renterName: 'Pangalan ng Umuupa / Layunin',
      discount: 'Diskwento',
      discountNone: 'Wala',
      discountPwdSenior: 'PWD / Senior Citizen (-20%)',
      discountAmountLabel: 'Diskwento',
      requiredDownPayment: 'Kinakailangang down payment (50%)',
      amountPaid: 'Nabayarang Halaga',
      notes: 'Tala',
      image: 'Larawan',
      spaceName: 'Pangalan ng Room / Espasyo',
      description: 'Deskripsyon',
      ratePerDay: 'Rate kada Araw',
      capacityField: 'Kapasidad'
    },
    toast: {
      validationRequired: 'Kailangan ang espasyo at pangalan ng umuupa',
      created: 'Nagawa ang booking',
      updated: 'Na-update ang booking',
      deleted: 'Naalis ang booking',
      confirmed: 'Nakumpirma ang booking',
      completed: 'Natapos ang booking',
      nameRequired: 'Kailangan ang pangalan ng room / espasyo',
      spaceAdded: 'Naidagdag ang "{{name}}"',
      spaceUpdated: 'Na-update ang "{{name}}"',
      spaceDeleted: 'Naalis ang "{{name}}"'
    },
    confirmDeleteSpace: {
      title: 'Alisin ang room/espasyong ito?',
      message: 'Aalisin ang "{{name}}" at hindi na ito magagamit para sa bagong booking.'
    },
    confirmDeleteBooking: {
      title: 'Alisin ang booking na ito?',
      message: 'Permanenteng aalisin ang booking para kay "{{name}}".'
    }
  },
  vouchers: {
    title: 'Mga Voucher',
    subtitle: 'Disbursement (Check) at Journal Vouchers',
    newVoucherButton: 'Bagong Voucher',
    type: {
      checkVoucher: 'Disbursement / Check Voucher',
      journalVoucher: 'Journal Voucher'
    },
    status: {
      posted: 'Naipasa Na'
    },
    actions: {
      approve: 'Aprubahan',
      post: 'I-post'
    },
    table: {
      number: 'Voucher #',
      type: 'Uri',
      payee: 'Payee',
      particulars: 'Mga Detalye',
      amount: 'Halaga',
      date: 'Petsa',
      status: 'Katayuan',
      empty: 'Walang nakitang voucher',
      exportTooltip: 'I-export ang voucher'
    },
    form: {
      voucherType: 'Uri ng Voucher',
      modeOfPayment: 'Paraan ng Pagbabayad',
      modeCash: 'Cash',
      modeCheck: 'Check',
      checkNumber: 'Numero ng Check',
      payee: 'Payee',
      payeePlaceholder: 'Pangalan ng vendor o tatanggap',
      payeeAddress: 'Address ng Payee',
      bankAccount: 'Bank Account (para sa Credit)',
      bankAccountPlaceholder: 'hal. DBP #00-500128590-5',
      glAccount: 'GL Account (Debit)',
      glAccountPlaceholder: 'hal. Telephone and Communications',
      amount: 'Halaga',
      particulars: 'Mga Detalye',
      createButton: 'Gumawa ng Voucher'
    },
    toast: {
      missingFields: 'Kailangan ang payee, account, at halaga',
      created: 'Nagawa na ang voucher',
      statusChanged: '{{number}} ay minarkahan bilang {{status}}',
      excelGenerated: 'Nagawa na ang Excel file sa opisyal na format ng Council',
      pdfGenerated: 'Nagawa na ang PDF file',
      wordGenerated: 'Nagawa na ang Word document'
    },
    confirmApprove: {
      title: 'Aprubahan ang Voucher',
      message: 'Aprubahan ang voucher {{number}}?'
    },
    confirmPost: {
      title: 'I-post ang Voucher',
      message:
        'I-post ang voucher {{number}} sa cash disbursement journal? Hindi na ito maaaring bawiin.'
    }
  },
  invoices: {
    title: 'Mga Invoice',
    newInvoiceButton: 'Bagong Invoice',
    markAsPaidButton: 'Markahan bilang Nabayaran',
    defaultMemo: 'Salamat po sa inyong suporta.',
    status: {
      sent: 'Naipadala',
      partial: 'Bahagyang Bayad'
    },
    filter: {
      all: 'Lahat'
    },
    summary: {
      overdue: 'Lumagpas sa Deadline',
      notDueYet: 'Hindi pa Dapat Bayaran',
      paid: 'Nabayaran'
    },
    table: {
      number: 'Numero',
      customer: 'Customer',
      issueDate: 'Petsa ng Pag-isyu',
      dueDate: 'Deadline ng Bayad',
      status: 'Katayuan',
      total: 'Kabuuan',
      balanceDue: 'Balanseng Dapat Bayaran',
      amount: 'Halaga',
      empty: 'Walang nakitang invoice'
    },
    detail: {
      issued: 'Ini-isyu Noong',
      due: 'Deadline',
      description: 'Paglalarawan',
      qty: 'Dami',
      rate: 'Rate',
      subtotal: 'Subtotal',
      tax: 'Buwis (12%)',
      total: 'Kabuuan'
    },
    form: {
      saveAsDraft: 'I-save bilang Draft',
      saveAndSend: 'I-save at Ipadala',
      selectCustomer: 'Pumili ng customer',
      lineItems: 'Mga Line Item',
      addLine: 'Magdagdag ng Linya',
      selectItem: 'Pumili ng item'
    },
    toast: {
      customerRequired: 'Mangyaring pumili ng customer.',
      dueDateRequired: 'Mangyaring itakda ang deadline ng bayad.',
      lineItemRequired: 'Magdagdag ng kahit isang line item.',
      sent: '{{number}} ay naipadala kay {{customer}}',
      savedAsDraft: '{{number}} ay na-save bilang draft',
      markedPaid: '{{number}} ay minarkahan bilang nabayaran'
    },
    confirmMarkPaid: {
      title: 'Markahan ang Invoice bilang Nabayaran',
      message:
        'Markahan ang invoice {{number}} ({{amount}}) bilang lubos na nabayaran? Hindi na ito maaaring bawiin.'
    }
  },
  customers: {
    title: 'Mga Customer',
    newCustomerButton: 'Bagong Customer',
    searchPlaceholder: 'Maghanap ng customer…',
    fields: {
      company: 'Kumpanya',
      email: 'Email',
      phone: 'Telepono',
      status: 'Katayuan',
      openBalance: 'Bukas na Balanse'
    },
    table: {
      name: 'Customer',
      empty: 'Walang nakitang customer'
    },
    detail: {
      totalBilled: 'Kabuuang Siningil',
      invoices: 'Mga Invoice',
      noInvoices: 'Wala pang invoice ang customer na ito.'
    },
    form: {
      fullName: 'Buong Pangalan',
      fullNamePlaceholder: 'Juan Dela Cruz',
      companyPlaceholder: 'Pangalan ng kumpanya',
      emailPlaceholder: 'name@company.ph',
      phonePlaceholder: '+63 9XX XXX XXXX',
      address: 'Address',
      addressPlaceholder: 'Lungsod, Probinsya',
      saveButton: 'I-save ang Customer'
    },
    toast: {
      missingFields: 'Kailangan ang pangalan at email.',
      created: '{{name}} ay naidagdag sa mga customer'
    }
  },
  expenses: {
    title: 'Mga Gastusin',
    newExpenseButton: 'Bagong Gastusin',
    summary: {
      total: 'Kabuuang Gastusin'
    },
    table: {
      date: 'Petsa',
      vendor: 'Vendor',
      category: 'Kategorya',
      paymentMethod: 'Paraan ng Pagbabayad',
      amount: 'Halaga',
      status: 'Katayuan',
      empty: 'Walang nakitang gastusin'
    },
    form: {
      selectVendor: 'Pumili ng vendor',
      saveButton: 'I-save ang Gastusin'
    },
    toast: {
      vendorRequired: 'Mangyaring pumili ng vendor.',
      invalidAmount: 'Maglagay ng wastong halaga.',
      created: 'Naitala ang gastusing {{amount}}'
    }
  },
  vendors: {
    title: 'Mga Vendor',
    addButton: 'Magdagdag ng Vendor',
    modalTitle: 'Bagong Vendor',
    saveButton: 'I-save ang Vendor',
    emptyMessage: 'Walang nahanap na vendor',
    validation: {
      nameEmailRequired: 'Kailangan ang pangalan at email.'
    },
    toast: {
      added: 'Naidagdag si {{name}} sa mga vendor'
    },
    columns: {
      vendor: 'Vendor',
      company: 'Kompanya',
      email: 'Email',
      phone: 'Telepono',
      category: 'Kategorya',
      balance: 'Balanse',
      status: 'Status'
    },
    form: {
      contactName: 'Pangalan ng Contact',
      contactNamePlaceholder: 'Pangalan ng contact',
      company: 'Kompanya',
      companyPlaceholder: 'Pangalan ng kompanya',
      email: 'Email',
      emailPlaceholder: 'name@company.ph',
      phone: 'Telepono',
      phonePlaceholder: '+63 9XX XXX XXXX',
      category: 'Kategorya'
    }
  },
  items: {
    title: 'Mga Produkto at Serbisyo',
    addButton: 'Bagong Item',
    modalTitle: 'Bagong Produkto / Serbisyo',
    saveButton: 'I-save ang Item',
    emptyMessage: 'Wala pang produkto o serbisyo',
    validation: {
      nameSkuRequired: 'Kailangan ang pangalan at SKU.'
    },
    toast: {
      added: 'Naidagdag si {{name}} sa mga produkto at serbisyo'
    },
    typeBadge: {
      service: 'Serbisyo',
      product: 'Produkto',
      inventory: 'Inventory'
    },
    columns: {
      name: 'Pangalan',
      sku: 'SKU',
      type: 'Uri',
      salesPrice: 'Presyo ng Benta',
      cost: 'Gastos',
      qtyOnHand: 'Dami sa Stock',
      incomeAccount: 'Income Account'
    },
    form: {
      name: 'Pangalan',
      namePlaceholder: 'Pangalan ng item',
      sku: 'SKU',
      skuPlaceholder: 'SKU-000',
      type: 'Uri',
      description: 'Deskripsyon',
      descriptionPlaceholder: 'Maikling deskripsyon',
      salesPrice: 'Presyo ng Benta',
      cost: 'Gastos',
      qtyOnHand: 'Dami sa Stock',
      incomeAccount: 'Income Account'
    }
  },
  reports: {
    title: 'Mga Ulat',
    tabs: {
      pnl: 'Kita at Gastos',
      balanceSheet: 'Balance Sheet'
    },
    pnl: {
      chartTitle: 'Kita kumpara sa Gastos',
      chartSubtitle: 'Huling 6 na buwan · cash basis',
      cardTitle: 'Kita at Gastos',
      cardSubtitle: 'Cash basis · bayad na invoice at bayad na gastos',
      income: 'Kita',
      expenses: 'Mga Gastos',
      totalIncome: 'Kabuuang Kita',
      totalExpenses: 'Kabuuang Gastos',
      netIncome: 'Net Income',
      exportLabel: 'I-export ang Income Statement',
      toast: {
        excel: 'Na-export ang Income Statement sa Excel',
        pdf: 'Na-export ang Income Statement bilang PDF',
        word: 'Na-export ang Income Statement bilang Word document'
      }
    },
    balanceSheet: {
      exportLabel: 'I-export ang Balance Sheet',
      assets: 'Mga Ari-arian',
      liabilities: 'Mga Pananagutan',
      equity: 'Equity',
      totalAssets: 'Kabuuang Ari-arian',
      totalLiabilities: 'Kabuuang Pananagutan',
      totalLiabilitiesEquity: 'Kabuuang Pananagutan at Equity',
      toast: {
        excel: 'Na-export ang Balance Sheet sa Excel',
        pdf: 'Na-export ang Balance Sheet bilang PDF',
        word: 'Na-export ang Balance Sheet bilang Word document'
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
    exportJournalLabel: 'I-export ang Journal',
    exportSummaryLabel: 'I-export ang SCRD',
    emptyReceipts: 'Walang naitalang cash receipt',
    emptyDisbursements: 'Walang posted/approved na disbursement voucher',
    beginningBalanceLabel: 'Beginning Balance:',
    interestIncomeLabel: 'Interest Income:',
    otherIncomeLabel: 'Other Income:',
    openingBalancesTitle: 'Opening Balance ng mga Bank Account',
    banks: {
      addButton: 'Magdagdag ng Bank',
      addTitle: 'Magdagdag ng Bank Account',
      name: 'Pangalan ng Bangko',
      namePlaceholder: 'hal. BDO, Cash on Hand',
      accountNumber: 'Account Number',
      accountNumberPlaceholder: 'Opsyonal',
      openingBalance: 'Opening Balance',
      toast: {
        nameRequired: 'Kailangan ang pangalan ng bangko',
        added: 'Naidagdag ang bank account'
      }
    },
    columns: {
      date: 'Petsa',
      payorPayee: 'Payor / Payee',
      particulars: 'Particulars',
      reference: 'Ref #',
      category: 'Kategorya',
      bankAccount: 'Bank Account',
      amount: 'Halaga'
    },
    summary: {
      beginningBalance: 'Beginning Balance',
      totalReceipts: 'Kabuuang Resibo',
      totalDisbursements: 'Kabuuang Disbursement',
      endingBalance: 'Ending Balance',
      receiptsByCategory: 'Mga Resibo ayon sa Kategorya',
      disbursementsByCategory: 'Mga Disbursement ayon sa Kategorya',
      generalOperations: 'A. General Operations',
      nesSales: 'B. National Equipment Service — Benta',
      rentalIncome: 'II. Rental Income',
      interestIncome: 'III. Interest Income',
      otherIncome: 'IV. Other Income',
      otherIncomeManualEntry: 'Other Income (Manual na Entry)',
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
      receiptsExcel: 'Na-export ang Cash Receipts Journal sa opisyal na format ng Council',
      receiptsPdf: 'Na-export ang Cash Receipts Journal bilang PDF',
      receiptsWord: 'Na-export ang Cash Receipts Journal bilang Word document',
      disbursementsExcel: 'Na-export ang Cash Disbursement Journal sa opisyal na format ng Council',
      disbursementsPdf: 'Na-export ang Cash Disbursement Journal bilang PDF',
      disbursementsWord: 'Na-export ang Cash Disbursement Journal bilang Word document',
      summaryExcel: 'Na-export ang SCRD sa opisyal na format ng Council',
      summaryPdf: 'Na-export ang SCRD bilang PDF',
      summaryWord: 'Na-export ang SCRD bilang Word document'
    }
  },
  pos: {
    title: 'Point of Sale',
    searchPlaceholder: 'Hanapin ang pangalan ng produkto o SKU…',
    stockLabel: 'Stock: {{count}}',
    noProductsMatch: 'Walang produktong tumugma sa iyong hanap.',
    completeSale: 'Tapusin ang Benta',
    tabs: {
      register: 'Sell',
      history: 'Kasaysayan ng Benta'
    },
    history: {
      emptyMessage: 'Wala pang benta.',
      itemsCount: '{{count}} item',
      printButton: 'I-print',
      voidButton: 'I-void',
      table: {
        saleNumber: 'Sale #',
        date: 'Petsa',
        cashier: 'Cashier',
        items: 'Items',
        payment: 'Paraan ng Bayad',
        total: 'Kabuuan',
        status: 'Status',
        actions: 'Aksyon'
      },
      status: {
        completed: 'Nakumpleto',
        voided: 'Na-void'
      },
      voidReasonTooltip: 'Dahilan ng pag-void: {{reason}}'
    },
    cart: {
      title: 'Cart ({{count}})',
      empty: 'Walang laman ang cart — mag-scan o mag-click ng produkto para idagdag.',
      noMember: 'Walang miyembro',
      printReceipt: 'I-print ang resibo',
      subtotal: 'Subtotal',
      discount: 'Diskwento',
      total: 'Kabuuan'
    },
    paymentMethods: {
      cash: 'Cash',
      card: 'Card',
      eWallet: 'E-Wallet'
    },
    toast: {
      codeNotFound: 'Walang natagpuang produkto o miyembro para sa code na "{{code}}"',
      memberScanned: 'Napili si {{name}} — {{rate}}% diskwento ang inilapat',
      cartEmpty: 'Walang laman ang cart',
      saleCompleted: 'Nakumpleto ang Benta {{saleNumber}} — {{amount}}',
      silentPrintFailed:
        'Hindi ma-print ang resibo — siguraduhing naka-connect at naka-configure ang receipt printer sa Settings',
      saleVoided: 'Na-void ang Benta {{saleNumber}} — naibalik ang stock',
      voidReasonRequired: 'Maglagay ng dahilan bago i-void ang bentang ito'
    },
    modal: {
      saleCompleteTitle: 'Nakumpleto ang Benta — {{saleNumber}}',
      printReceipt: 'I-print ang Resibo',
      paymentReceivedVia: 'Natanggap ang bayad sa pamamagitan ng {{method}}',
      undoSale: 'I-undo ang Benta',
      undoSaleConfirmTitle: 'I-undo ang bentang ito?',
      undoSaleConfirmMessage:
        'Ma-void ang Benta {{saleNumber}} at maibabalik ang mga item sa stock. Hindi na ito maaaring bawiin.',
      undoSaleReasonLabel: 'Dahilan ng void/refund',
      undoSaleReasonPlaceholder: 'hal. Maling item ang na-ring up, humingi ng refund ang customer…'
    }
  },
  products: {
    title: 'Inventory',
    addButton: 'Magdagdag ng Produkto',
    searchPlaceholder: 'Maghanap ng produkto…',
    lowStockAlert: '{{count}} produkto ang nasa o mababa na sa reorder level: {{names}}',
    restockButton: 'I-restock',
    printLabelButton: 'I-print ang Label',
    export: {
      salesReport: 'Ulat ng Benta',
      inventoryReport: 'Ulat ng Inventory',
      incomeStatement: 'Income Statement'
    },
    period: {
      monthly: 'Buwanan',
      quarterly: 'Quarterly',
      quarterEndedPlaceholder: 'hal. Marso 31, 2026'
    },
    table: {
      emptyMessage: 'Walang nahanap na produkto',
      image: 'Larawan',
      skuBarcode: 'SKU / Barcode',
      product: 'Produkto',
      category: 'Kategorya',
      cost: 'Halaga ng Puhunan',
      price: 'Presyo',
      stock: 'Stock',
      status: 'Katayuan'
    },
    form: {
      image: 'Larawan ng Produkto',
      uploadImage: 'Mag-upload ng Larawan',
      skuBarcode: 'SKU / Barcode',
      category: 'Kategorya',
      selectCategory: 'Pumili ng kategorya…',
      description: 'Paglalarawan',
      unit: 'Yunit',
      productName: 'Pangalan ng Produkto',
      costPrice: 'Halaga ng Puhunan',
      sellingPrice: 'Presyong Ibebenta',
      stockQuantity: 'Dami ng Stock',
      reorderLevel: 'Reorder Level',
      numberOfLabels: 'Bilang ng label',
      quantityToAdd: 'Dami na Idadagdag',
      unitCost: 'Halaga bawat Yunit'
    },
    modal: {
      addProductTitle: 'Magdagdag ng Produkto',
      editProductTitle: 'I-edit ang Produkto',
      saveProduct: 'I-save ang Produkto',
      printLabelsTitle: 'I-print ang Barcode Label — {{name}}',
      preview: 'Preview',
      print: 'I-print',
      restockTitle: 'Restock — {{name}}',
      addStock: 'Magdagdag ng Stock',
      currentStockLabel: 'Kasalukuyang stock:',
      units: 'yunit'
    },
    confirmDelete: {
      title: 'Burahin ang Produkto',
      message:
        'Burahin ang {{name}}? Permanenteng aalisin ito sa inventory. Hindi maaapektuhan ang mga naunang sales at purchase record na tumutukoy dito. Hindi na ito maibabalik.'
    },
    toast: {
      skuNameRequired: 'Kailangan ang SKU at pangalan',
      duplicateSku: 'May produkto nang gumagamit ng SKU na ito',
      productAdded: '{{name}} ay idinagdag sa inventory',
      productUpdated: '{{name}} ay na-update',
      deleted: '{{name}} ay binura sa inventory',
      invalidQuantity: 'Maglagay ng tamang dami',
      restockSuccess: '{{count}} yunit ng {{name}} ang idinagdag sa stock',
      noSalesToReport: 'Wala pang naitalang benta na iuulat',
      salesReportExportedExcel:
        'Na-export ang NES Monthly Sales Report sa opisyal na format ng Council',
      salesReportExportedPdf: 'Na-export ang NES Monthly Sales Report bilang PDF',
      salesReportExportedWord: 'Na-export ang NES Monthly Sales Report bilang Word document',
      inventoryReportExportedExcel:
        'Na-export ang NES Monthly Inventory Report sa opisyal na format ng Council',
      inventoryReportExportedPdf: 'Na-export ang NES Monthly Inventory Report bilang PDF',
      inventoryReportExportedWord:
        'Na-export ang NES Monthly Inventory Report bilang Word document',
      incomeStatementExportedExcel: 'Awtomatikong nakalkula at na-export ang NES Income Statement',
      incomeStatementExportedPdf: 'Na-export ang NES Income Statement bilang PDF',
      incomeStatementExportedWord: 'Na-export ang NES Income Statement bilang Word document'
    }
  },
  members: {
    title: 'Mga Miyembro',
    addButton: 'Magdagdag ng Miyembro',
    printCardButton: 'I-print ang Loyalty Card',
    table: {
      emptyMessage: 'Walang nahanap na miyembro',
      memberCode: 'Member Code',
      name: 'Pangalan',
      email: 'Email',
      discount: 'Diskwento'
    },
    form: {
      memberCode: 'Member Code',
      name: 'Pangalan',
      email: 'Email',
      discountRate: 'Discount Rate (%)',
      numberOfCards: 'Bilang ng card'
    },
    modal: {
      addMemberTitle: 'Magdagdag ng Miyembro',
      editMemberTitle: 'I-edit ang Miyembro',
      saveMember: 'I-save ang Miyembro',
      printCardTitle: 'Loyalty Card — {{name}}',
      preview: 'Preview',
      print: 'I-print',
      scanHint:
        'Maaaring i-scan ang barcode na ito sa Point of Sale para ilapat ang diskwento ng miyembro.'
    },
    card: {
      discountLabel: '{{rate}}% Diskwento ng Miyembro'
    },
    confirmDelete: {
      title: 'Burahin ang Miyembro',
      message: 'Burahin si {{name}}? Hindi na ito maibabalik.'
    },
    toast: {
      codeNameRequired: 'Kailangan ang member code at pangalan',
      memberAdded: '{{name}} ay idinagdag bilang miyembro',
      memberUpdated: 'Na-update si {{name}}',
      memberDeleted: 'Nabura si {{name}}'
    }
  },
  users: {
    title: 'Mga User Account',
    addButton: 'Magdagdag ng User',
    emptyState: 'Walang nahanap na user account',
    statusDisabled: 'Naka-disable',
    disable: 'I-disable',
    enable: 'I-enable',
    table: {
      fullName: 'Buong Pangalan',
      role: 'Role',
      status: 'Status',
      action: 'Aksyon'
    },
    rolePermissions: {
      title: 'Mga Permission ng Role',
      subtitle: 'Kontrolin kung anong mga module ang makikita at magagamit ng bawat role.',
      permissionsGranted: '{{granted}} / {{total}} na permission ang naibigay',
      editButton: 'I-edit ang Permissions',
      addRole: {
        button: 'Magdagdag ng Role',
        title: 'Magdagdag ng Role',
        nameLabel: 'Pangalan ng Role',
        namePlaceholder: 'hal. Front Desk',
        submitButton: 'Idagdag ang Role',
        note: 'Makikita at magagawa ng role na ito ang eksaktong ibibigay mo sa ibaba — i-check ang bawat module na dapat nitong ma-access.',
        errors: {
          required: 'Kailangan ang pangalan ng role',
          invalid: 'Dapat may kahit isang letra o numero ang pangalan ng role',
          duplicate: 'May role na gumagamit na ng pangalang ito'
        }
      },
      deleteRole: {
        confirmTitle: 'Tanggalin ang Role',
        confirmMessage: 'Tanggalin ang role na "{{role}}"? Hindi na ito maibabalik.',
        success: 'Natanggal ang role na "{{role}}"',
        inUse: 'Naka-assign sa {{count}} user — i-reassign muna sila bago tanggalin ang role na ito'
      }
    },
    addModal: {
      title: 'Magdagdag ng User Account',
      fullNameLabel: 'Buong Pangalan',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      roleLabel: 'Role',
      generateButton: 'Bumuo ng Command',
      commandHelp:
        'Walang admin credentials ang app na ito, kaya sa terminal tumatakbo ang mga pagbabago sa account. Kopyahin ang command na ito at patakbuhin sa isang makina na may service account key ng project.',
      copyButton: 'Kopyahin ang Command'
    },
    editModal: {
      titleDefault: 'I-edit ang User',
      titleWithName: 'I-edit si {{fullName}}',
      generateButton: 'Bumuo ng Command',
      roleChangeHint:
        'Ang pagbabago ng role ay nangangailangan ng command na patatakbuhin mula sa developer machine — hindi nagdadala ang app ng admin credentials.'
    },
    permissionsModal: {
      titleDefault: 'Mga Permission ng Role',
      titleWithRole: 'Mga Permission ng {{role}}',
      doneButton: 'Tapos na',
      manage: 'Pamahalaan'
    },
    toast: {
      missingFields: 'Kailangan ang buong pangalan, email, at password',
      fullNameRequired: 'Kailangan ang buong pangalan',
      userDisabled: 'Na-disable ang user na "{{fullName}}"',
      userEnabled: 'Na-enable ang user na "{{fullName}}"',
      toggleActiveFailed: 'Hindi na-update ang account na ito. Subukan muli.',
      fullNameUpdated: 'Na-save ang "{{fullName}}"',
      fullNameUpdateFailed: 'Hindi na-save ang pangalan. Subukan muli.',
      commandCopied: 'Nakopya ang command sa clipboard',
      commandCopyFailed: 'Hindi nakopya ang command'
    },
    confirmDisable: {
      title: 'I-disable ang User Account',
      message:
        'I-disable ang "{{fullName}}"? Hindi na sila makaka-log in hangga\'t hindi ulit na-enable.'
    },
    confirmEnable: {
      title: 'I-enable ang User Account',
      message: 'I-enable ang "{{fullName}}"? Makakabalik sila sa pag-log in.'
    }
  },
  auditLog: {
    title: 'Audit Log',
    subtitle: '{{count}} kaganapan sa session na ito',
    emptyMessage:
      'Wala pang naitalang aktibidad sa session na ito — lalabas dito ang mga aksyon sa buong app.',
    table: {
      when: 'Kailan',
      actor: 'Gumawa',
      entity: 'Entity',
      action: 'Aksyon',
      summary: 'Buod'
    }
  },
  goals: {
    title: 'Mga Layunin at Tunguhin',
    programYear: 'Taon ng Programa {{year}}',
    exportLabel: 'I-export ang Ulat',
    goalLabel: 'Layunin {{code}}',
    empty: 'Walang nahanap na objective',
    noGoals: 'Wala pang layunin. Gumawa ng iyong unang layunin para magsimula.',
    newGoalButton: 'Bagong Layunin',
    editGoalButton: 'I-edit ang Layunin',
    deleteGoalButton: 'Burahin ang Layunin',
    addObjectiveButton: 'Magdagdag ng Objective',
    editObjectiveButton: 'I-edit ang Objective',
    table: {
      code: 'Code',
      objective: 'Objective',
      annualTarget: 'Taunang Target',
      thisMonth: 'Nakamit noong {{month}}',
      autoTracked: 'Awtomatikong kinukuha mula sa Benta',
      achievedToDate: 'Nakamit Hanggang Ngayon',
      percentAchieved: '% Nakamit'
    },
    form: {
      goalCode: 'Code ng Layunin',
      goalTitle: 'Pamagat ng Layunin',
      goalTitlePlaceholder: 'hal. More Opportunities for More Girls',
      objectiveCode: 'Code ng Objective',
      objectiveCodePlaceholder: 'hal. 1.a.1',
      objectiveLabel: 'Objective',
      objectiveLabelPlaceholder: 'hal. Membership — School-based',
      unit: 'Yunit',
      unitCount: 'Bilang',
      unitPeso: 'Piso (₱)',
      unitPercent: 'Porsyento (%)'
    },
    confirmDeleteGoal: {
      title: 'Burahin ang Layunin',
      message:
        'Sigurado ka bang buburahin ang "{{title}}"? Permanenteng mababawi ang lahat ng objectives at progress nito.'
    },
    confirmDeleteObjective: {
      title: 'Burahin ang Objective',
      message:
        'Sigurado ka bang buburahin ang "{{label}}"? Permanenteng mababawi ang history ng progress nito.'
    },
    toast: {
      exportedExcel: 'Na-export ang ulat ng Goals & Objectives sa Excel',
      exportedPdf: 'Na-export ang ulat ng Goals & Objectives bilang PDF',
      exportedWord: 'Na-export ang ulat ng Goals & Objectives bilang Word document',
      missingTitle: 'Kailangan ang pamagat ng layunin',
      missingObjectiveFields: 'Kailangan ang code at label ng objective',
      goalCreated: 'Nagawa ang layunin',
      goalUpdated: 'Na-update ang layunin',
      goalDeleted: 'Nabura ang layunin',
      objectiveCreated: 'Naidagdag ang objective',
      objectiveUpdated: 'Na-update ang objective',
      objectiveDeleted: 'Nabura ang objective'
    }
  }
} as const

export default tl
