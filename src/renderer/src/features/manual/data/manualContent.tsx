import type { ReactNode } from 'react'
import {
  LayoutDashboard,
  Megaphone,
  ShoppingCart,
  Boxes,
  Users,
  FileText,
  Wallet2,
  Truck,
  Ticket,
  BarChart3,
  Tent,
  Target,
  ClipboardList,
  GraduationCap,
  UserCog,
  Fingerprint,
  CalendarClock,
  Wallet,
  Network,
  Building2,
  UserCheck,
  CalendarDays,
  UserCog2,
  Settings as SettingsIcon,
  Usb,
  Info
} from 'lucide-react'

/**
 * Manual copy is kept here (not in the i18n locale files) because it's long-form,
 * page-specific prose rather than short reusable UI strings — bilingual pairs are
 * inlined per field so the two languages stay next to each other and easy to keep
 * in sync as modules change.
 */
export interface Bilingual {
  en: string
  tl: string
}

export interface ManualModule {
  /** Matches a key in MODULE_PERMISSIONS / MODULE_LABELS / MODULE_ROUTES, or 'settings' | 'devices' | 'about'. */
  key: string
  icon: ReactNode
  summary: Bilingual
  steps: { en: string[]; tl: string[] }
  tips?: { en: string[]; tl: string[] }
}

export interface ManualSection {
  key: string
  icon: ReactNode
  modules: ManualModule[]
}

export const manualSections: ManualSection[] = [
  {
    key: 'core',
    icon: <LayoutDashboard size={16} />,
    modules: [
      {
        key: 'dashboard',
        icon: <LayoutDashboard size={16} />,
        summary: {
          en: 'A snapshot of the whole council: sales, collections, low-stock items, attendance, pending leave, and the latest announcements.',
          tl: 'Buod ng buong konseho: benta, koleksyon, mababang stock, attendance, nakabinbing leave, at pinakabagong anunsyo.'
        },
        steps: {
          en: [
            'Sign in — you land here automatically unless your role has a different home page (Cashier → Point of Sale, HR → Employees).',
            'Scan the summary cards for anything that needs attention, e.g. low-stock items or pending leave requests.',
            'Use "View all" on any card to jump straight to that module.'
          ],
          tl: [
            'Mag-sign in — dadalhin ka rito automatic maliban kung ibang home page ang role mo (Cashier → Point of Sale, HR → Employees).',
            'Tingnan ang mga summary card kung may kailangang aksyon, hal. mababang stock o nakabinbing leave request.',
            'Gamitin ang "View all" sa kahit anong card para diretso sa module na iyon.'
          ]
        }
      },
      {
        key: 'announcements',
        icon: <Megaphone size={16} />,
        summary: {
          en: 'Council-wide announcements board, also highlighted on the Dashboard — read by every signed-in user, posted only by Admins.',
          tl: 'Board ng mga anunsyo ng buong konseho, kasama sa Dashboard — nababasa ng lahat, pero ang Admin lang ang nakakapag-post.'
        },
        steps: {
          en: [
            'Open Announcements to read the full feed, newest first.',
            'If you are a Super Admin or Admin, use the compose button to post a new announcement.',
            'Edit or remove a post you no longer need — it disappears from every device, including gspi-app (mobile).'
          ],
          tl: [
            'Buksan ang Announcements para basahin ang buong feed, pinakabago muna.',
            'Kung Super Admin o Admin ka, gamitin ang compose button para mag-post ng bagong anunsyo.',
            'I-edit o tanggalin ang post na hindi na kailangan — mawawala ito sa lahat ng device, kasama ang gspi-app (mobile).'
          ]
        }
      },
      {
        key: 'pos',
        icon: <ShoppingCart size={16} />,
        summary: {
          en: 'The checkout screen — ring up sales of council merchandise and Girl Scout supplies.',
          tl: 'Ang checkout screen — mag-benta ng merchandise ng konseho at gamit pang-Girl Scout.'
        },
        steps: {
          en: [
            'Search or scan a product to add it to the current sale (a connected barcode scanner works automatically — see Devices).',
            'Adjust quantities, apply any discount, and pick a payment method.',
            'Complete the sale to print or reprint a receipt; every sale is saved to Sales History.',
            'Accountants can view Point of Sale for the Daily Collections report, but only Cashiers and Admins can ring up a sale.'
          ],
          tl: [
            'Maghanap o i-scan ang produkto para idagdag sa kasalukuyang benta (automatic gumagana ang naka-connect na barcode scanner — tingnan ang Devices).',
            'I-adjust ang quantity, ilagay ang discount kung meron, at piliin ang paraan ng bayad.',
            'Kumpletuhin ang benta para mag-print o magprint-ulit ng resibo; naka-save ang bawat benta sa Sales History.',
            'Makikita ng Accountant ang Point of Sale para sa Daily Collections report, pero Cashier at Admin lang ang pwedeng magbenta.'
          ]
        }
      },
      {
        key: 'products',
        icon: <Boxes size={16} />,
        summary: {
          en: 'Inventory of everything sold through Point of Sale — stock levels, prices, categories, and low-stock alerts.',
          tl: 'Inventory ng lahat ng binebenta sa Point of Sale — stock level, presyo, category, at low-stock alert.'
        },
        steps: {
          en: [
            'Add a product with its name, SKU/barcode, price, category, and starting stock.',
            "Edit stock counts as inventory comes in — the Dashboard's Low Stock card watches these levels.",
            "Categories are a shared system list (seeded once) used by this app and gspi-app — you can't add or rename one here."
          ],
          tl: [
            'Magdagdag ng produkto kasama ang pangalan, SKU/barcode, presyo, category, at starting stock.',
            'I-edit ang stock count kapag may dumating na paninda — sinusubaybayan ito ng Low Stock card sa Dashboard.',
            'Ang categories ay shared system list (naka-seed na, minsan lang) na ginagamit ng app na ito at ng gspi-app — hindi ka pwedeng magdagdag o magpalit ng pangalan dito.'
          ]
        }
      },
      {
        key: 'members',
        icon: <Users size={16} />,
        summary: {
          en: 'Point-of-Sale members (e.g. for member pricing/loyalty) — a different list from the Girl Scout roster under Troops.',
          tl: 'Mga miyembro para sa Point of Sale (hal. para sa member pricing/loyalty) — iba ito sa roster ng Girl Scout na nasa Troops.'
        },
        steps: {
          en: [
            'Add a member with their basic details before checking them out at the POS for any member-specific pricing.',
            "Search here whenever a cashier needs to look up or update a member's record."
          ],
          tl: [
            'Magdagdag ng miyembro kasama ang basic details bago i-checkout sa POS para sa member-specific na presyo.',
            'Maghanap dito kapag kailangan ng cashier na hanapin o i-update ang record ng isang miyembro.'
          ]
        },
        tips: {
          en: [
            'Looking for the Girl Scout troop roster instead? That lives under Troops, not here.'
          ],
          tl: ['Hinahanap ang roster ng troop ng Girl Scout? Nasa Troops iyon, hindi dito.']
        }
      }
    ]
  },
  {
    key: 'crm',
    icon: <Users size={16} />,
    modules: [
      {
        key: 'invoices',
        icon: <FileText size={16} />,
        summary: {
          en: 'Bill customers for rentals, services, or bulk orders and track which invoices are paid.',
          tl: 'Mag-bill ng customer para sa rental, serbisyo, o bulk order at subaybayan kung alin ang bayad na.'
        },
        steps: {
          en: [
            'Create a new invoice, pick the customer, and add line items with quantities and prices.',
            'Save it as a draft or issue it — its status moves from Unpaid to Paid (or Overdue) as payments come in.',
            'Open any invoice to view or export it for printing/emailing.'
          ],
          tl: [
            'Gumawa ng bagong invoice, piliin ang customer, at magdagdag ng line items kasama ang quantity at presyo.',
            'I-save bilang draft o i-issue — ang status ay magbabago mula Unpaid papuntang Paid (o Overdue) habang may bayad na dumadating.',
            'Buksan ang kahit anong invoice para tingnan o i-export para sa pag-print/pag-email.'
          ]
        }
      },
      {
        key: 'customers',
        icon: <Users size={16} />,
        summary: {
          en: 'The customer directory used across Invoices — companies or individuals the council bills.',
          tl: 'Ang directory ng customer na ginagamit sa Invoices — kompanya o indibidwal na binibill ng konseho.'
        },
        steps: {
          en: [
            'Add a customer once, then reuse them on any invoice.',
            'Keep contact details up to date so invoices and reports stay accurate.'
          ],
          tl: [
            'Magdagdag ng customer minsan lang, pagkatapos gamitin ito sa kahit anong invoice.',
            'I-update ang contact details para tama palagi ang invoice at reports.'
          ]
        }
      }
    ]
  },
  {
    key: 'accounting',
    icon: <BarChart3 size={16} />,
    modules: [
      {
        key: 'budget',
        icon: <Wallet2 size={16} />,
        summary: {
          en: "This year's Council Budget — how much was budgeted per line item versus what's actually been spent, month by month.",
          tl: 'Ang Council Budget para sa taong ito — kung magkano ang budget bawat line item kumpara sa aktwal na nagastos, bawat buwan.'
        },
        steps: {
          en: [
            "Review each line item's budgeted amount against its actual monthly spend.",
            "Accountants can update a line item's budgeted amount or monthly actuals; Managers can view but not edit."
          ],
          tl: [
            'Suriin ang budgeted amount ng bawat line item kumpara sa aktwal na ginastos bawat buwan.',
            'Pwedeng i-update ng Accountant ang budgeted amount o monthly actuals; ang Manager ay makakatingin lang, hindi makakapag-edit.'
          ]
        }
      },
      {
        key: 'vendors',
        icon: <Truck size={16} />,
        summary: {
          en: 'The vendor directory for anything the council buys or pays for — used when recording expenses and purchase orders.',
          tl: 'Directory ng vendor para sa kahit anong binibili o binabayaran ng konseho — ginagamit sa pagrekord ng gastos at purchase order.'
        },
        steps: {
          en: [
            'Add a vendor once with their contact and payment details.',
            'Reuse the vendor whenever you record a purchase, bill, or voucher tied to them.'
          ],
          tl: [
            'Magdagdag ng vendor minsan lang kasama ang contact at payment details.',
            'Gamitin ulit ang vendor kapag nagrerecord ng purchase, bill, o voucher na may kinalaman sa kanila.'
          ]
        }
      },
      {
        key: 'vouchers',
        icon: <Ticket size={16} />,
        summary: {
          en: 'Cash disbursement vouchers — the paper trail for money paid out by the council.',
          tl: 'Cash disbursement voucher — ang paper trail para sa pera na binayaran ng konseho.'
        },
        steps: {
          en: [
            "Create a voucher for each disbursement: who it's paid to, the amount, and what it covers.",
            'Attach or reference supporting documents so the entry is audit-ready.'
          ],
          tl: [
            'Gumawa ng voucher para sa bawat disbursement: kanino binayaran, magkano, at para saan.',
            'Mag-attach o mag-refer ng supporting documents para audit-ready ang entry.'
          ]
        }
      },
      {
        key: 'reports',
        icon: <BarChart3 size={16} />,
        summary: {
          en: "Balance Sheet, Income Statement, and Daily Collections — the council's core financial reports, generated from live data.",
          tl: 'Balance Sheet, Income Statement, at Daily Collections — ang pangunahing financial reports ng konseho, buhat sa live data.'
        },
        steps: {
          en: [
            'Pick the report and period you need.',
            'Daily Collections automatically rolls up cash from Point of Sale sales, paid invoices, confirmed rental bookings, and registration fees.',
            'Export a report when you need a printable or shareable copy.'
          ],
          tl: [
            'Piliin ang report at panahon na kailangan.',
            'Ang Daily Collections ay automatic na nagro-roll up ng cash mula sa Point of Sale sales, bayad na invoice, kumpirmadong rental booking, at registration fees.',
            'I-export ang report kapag kailangan ng printable o mai-share na kopya.'
          ]
        }
      },
      {
        key: 'scrd',
        icon: <FileText size={16} />,
        summary: {
          en: 'Cash Receipts & Disbursements — bank account balances and the ledger of money moving in and out of them.',
          tl: 'Cash Receipts & Disbursements — balanse ng bank account at ang ledger ng pera na papasok at palabas.'
        },
        steps: {
          en: [
            'Record a receipt or disbursement against the right bank account.',
            "The account's current balance recalculates automatically — you never type that number in directly."
          ],
          tl: [
            'Magrekord ng receipt o disbursement laban sa tamang bank account.',
            'Automatic na nagre-recalculate ang current balance ng account — hindi mo ito direktang tina-type.'
          ]
        }
      }
    ]
  },
  {
    key: 'councilPrograms',
    icon: <Tent size={16} />,
    modules: [
      {
        key: 'troops',
        icon: <Tent size={16} />,
        summary: {
          en: 'Every troop in the council and its Girl Scout member roster.',
          tl: 'Bawat troop sa konseho at ang roster ng miyembrong Girl Scout nito.'
        },
        steps: {
          en: [
            'Open a troop to see its member roster, or add a new troop.',
            "Add or edit a scout member's record from within their troop's profile.",
            "Accountants can read this roster too — a member's registration fee feeds into Daily Collections."
          ],
          tl: [
            'Buksan ang troop para makita ang roster ng miyembro, o magdagdag ng bagong troop.',
            'Magdagdag o mag-edit ng record ng scout member mula sa profile ng kanilang troop.',
            'Pwede ring basahin ng Accountant ang roster na ito — ang registration fee ng miyembro ay bahagi ng Daily Collections.'
          ]
        }
      },
      {
        key: 'goals',
        icon: <Target size={16} />,
        summary: {
          en: "The council's Goals & Objectives for the program year, tracked against progress.",
          tl: 'Ang Goals & Objectives ng konseho para sa taong ito, sinusubaybayan ang progreso.'
        },
        steps: {
          en: [
            'Add a goal with its target and track progress as the year goes on.',
            'Accountants and Managers can both keep these updated.'
          ],
          tl: [
            'Magdagdag ng goal kasama ang target at subaybayan ang progreso habang tumatagal ang taon.',
            'Pwedeng i-update ito ng Accountant at Manager.'
          ]
        }
      },
      {
        key: 'programReports',
        icon: <ClipboardList size={16} />,
        summary: {
          en: "Monthly detail reports for Badgework, Troop Camps, Improved Image, and International Affairs — National HQ's program goals for the council.",
          tl: 'Buwanang detalyadong ulat para sa Badgework, Troop Camps, Improved Image, at International Affairs — mga programa na itinakda ng National HQ para sa konseho.'
        },
        steps: {
          en: [
            'Pick a program section and add its monthly line items.',
            'The section title/Goal heading printed above each report can be edited — National HQ changes its wording between program years.'
          ],
          tl: [
            'Piliin ang program section at magdagdag ng buwanang line items nito.',
            'Ang section title/Goal heading na naka-print sa itaas ng bawat ulat ay pwedeng i-edit — nagbabago ang wording nito ayon sa National HQ bawat program year.'
          ]
        }
      },
      {
        key: 'trainingReports',
        icon: <GraduationCap size={16} />,
        summary: {
          en: 'Training activities conducted for troop leaders and members, logged for council reporting.',
          tl: 'Mga training na isinagawa para sa mga troop leader at miyembro, naka-log para sa ulat ng konseho.'
        },
        steps: {
          en: ["Log each training with its date, topic, and attendees for the council's records."],
          tl: [
            'I-log ang bawat training kasama ang petsa, paksa, at mga dumalo para sa record ng konseho.'
          ]
        }
      }
    ]
  },
  {
    key: 'hrPayroll',
    icon: <UserCog size={16} />,
    modules: [
      {
        key: 'employees',
        icon: <UserCog size={16} />,
        summary: {
          en: 'The staff directory — profiles, employment details, and documents for every council employee.',
          tl: 'Ang directory ng staff — profile, detalye ng trabaho, at dokumento ng bawat empleyado ng konseho.'
        },
        steps: {
          en: [
            "Open an employee's profile to view or update their employment details and documents.",
            "This is separate from their login account under Users — changing role/login here doesn't apply; that's handled in Users."
          ],
          tl: [
            'Buksan ang profile ng empleyado para tingnan o i-update ang detalye ng trabaho at dokumento.',
            'Iba ito sa kanilang login account sa Users — ang pagbabago ng role/login ay hindi dito ginagawa; sa Users iyon.'
          ]
        }
      },
      {
        key: 'attendance',
        icon: <Fingerprint size={16} />,
        summary: {
          en: 'Daily time-in/time-out records, either logged manually or captured live from a connected biometric terminal.',
          tl: 'Araw-araw na time-in/time-out, maaaring i-log manually o awtomatikong makuha mula sa naka-connect na biometric terminal.'
        },
        steps: {
          en: [
            "Review today's attendance — present, absent, and on-leave counts feed the Dashboard.",
            "Enroll an employee's face at Attendance > Enrollment so the Hikvision terminal recognizes them (the terminal itself is set up under Settings > Devices)."
          ],
          tl: [
            'Tingnan ang attendance ngayong araw — present, absent, at on-leave na bilang ay lumalabas din sa Dashboard.',
            'I-enroll ang mukha ng empleyado sa Attendance > Enrollment para makilala sila ng Hikvision terminal (ang terminal mismo ay ise-setup sa Settings > Devices).'
          ]
        }
      },
      {
        key: 'leave',
        icon: <CalendarClock size={16} />,
        summary: {
          en: "Leave requests and each employee's leave credit balance.",
          tl: 'Mga leave request at ang balanse ng leave credit ng bawat empleyado.'
        },
        steps: {
          en: [
            'Review a pending request and approve or reject it — the Dashboard flags anything still waiting.',
            'Grant leave credits (e.g. at the start of a cycle) from the credit grants screen.'
          ],
          tl: [
            'Suriin ang nakabinbing request at aprubahan o tanggihan ito — ipapakita rin ito sa Dashboard kung may nakabinbin pa.',
            'Magbigay ng leave credit (hal. sa simula ng cycle) mula sa credit grants screen.'
          ]
        }
      },
      {
        key: 'payroll',
        icon: <Wallet size={16} />,
        summary: {
          en: 'Payroll runs for every pay period, including 13th Month Pay and the year-end Cash Gift.',
          tl: 'Payroll para sa bawat pay period, kasama ang 13th Month Pay at ang Cash Gift sa katapusan ng taon.'
        },
        steps: {
          en: [
            "Filter by pay period and generate/review each employee's payroll entry.",
            "13th Month Pay computes automatically from each employee's actual basic pay for the year; the council-wide Cash Gift default amount is set once under Settings, by an Admin."
          ],
          tl: [
            'I-filter ayon sa pay period at bumuo/suriin ang payroll entry ng bawat empleyado.',
            'Automatic na kinakalkula ang 13th Month Pay batay sa aktwal na basic pay ng empleyado sa buong taon; ang default na Cash Gift amount ng buong konseho ay itinatakda minsan sa Settings, ng Admin.'
          ]
        }
      },
      {
        key: 'orgChart',
        icon: <Network size={16} />,
        summary: {
          en: "A visual reporting-line chart of the council's staff.",
          tl: 'Visual na chart ng reporting line ng staff ng konseho.'
        },
        steps: {
          en: [
            "Open Organizational Chart to see who reports to whom, drawn from each employee's profile."
          ],
          tl: [
            'Buksan ang Organizational Chart para makita kung sino ang nag-uulat kanino, batay sa profile ng bawat empleyado.'
          ]
        }
      }
    ]
  },
  {
    key: 'facility',
    icon: <Building2 size={16} />,
    modules: [
      {
        key: 'rentals',
        icon: <Building2 size={16} />,
        summary: {
          en: 'Rentable spaces the council owns, and the bookings made against them.',
          tl: 'Mga puwedeng paupahan na pag-aari ng konseho, at ang mga booking dito.'
        },
        steps: {
          en: [
            'Add a rental space once with its rate and capacity.',
            'Create a booking for a client, then confirm it once payment is settled — confirmed/completed bookings feed Daily Collections.'
          ],
          tl: [
            'Magdagdag ng rental space minsan lang kasama ang rate at capacity.',
            'Gumawa ng booking para sa client, pagkatapos kumpirmahin kapag nabayaran na — ang kumpirmado/tapos na booking ay bahagi ng Daily Collections.'
          ]
        }
      },
      {
        key: 'visitors',
        icon: <UserCheck size={16} />,
        summary: {
          en: 'The front-desk logbook — who came in, when, and why.',
          tl: 'Ang logbook sa front desk — sino ang pumasok, kailan, at bakit.'
        },
        steps: {
          en: [
            'Log each visitor as they arrive; Cashier, HR, and Manager can all record entries here.'
          ],
          tl: [
            'I-log ang bawat bisita paglabas nila; ang Cashier, HR, at Manager ay pwedeng magrekord dito.'
          ]
        }
      },
      {
        key: 'facilityCalendar',
        icon: <CalendarDays size={16} />,
        summary: {
          en: 'A calendar view of all rental bookings, so double-bookings are easy to spot at a glance.',
          tl: 'Calendar view ng lahat ng rental booking, para madaling makita ang double-booking.'
        },
        steps: {
          en: [
            "Browse by day/week/month to see what's already booked before confirming a new one."
          ],
          tl: [
            'I-browse ayon sa araw/linggo/buwan para makita kung ano ang booked na bago kumpirmahin ang bago.'
          ]
        }
      }
    ]
  },
  {
    key: 'admin',
    icon: <UserCog2 size={16} />,
    modules: [
      {
        key: 'users',
        icon: <UserCog2 size={16} />,
        summary: {
          en: 'Staff login accounts, their roles, and the Role Permissions matrix that controls what each role can see.',
          tl: 'Mga login account ng staff, ang kanilang role, at ang Role Permissions matrix na kumokontrol kung ano ang makikita ng bawat role.'
        },
        steps: {
          en: [
            'Add a new staff account with their email, full name, and role.',
            "Use Enable/Disable to suspend a departed or temporarily inactive staff member's access without deleting their history.",
            'Rename a user or update their status directly; a role change goes through the Edit User dialog.',
            'Scroll down to Role Permissions to view or fine-tune exactly which modules each role (built-in or custom) can view/manage, or to create a custom role with its own label.'
          ],
          tl: [
            'Magdagdag ng bagong staff account kasama ang email, buong pangalan, at role.',
            'Gamitin ang Enable/Disable para suspindihin ang access ng nag-resign o pansamantalang hindi aktibong staff nang hindi tinatanggal ang history nila.',
            'Palitan ang pangalan o i-update ang status nang diretso; ang pagbabago ng role ay sa Edit User dialog dinadaan.',
            'I-scroll pababa sa Role Permissions para tingnan o i-fine-tune kung anong module ang makikita/magagawa ng bawat role (built-in man o custom), o gumawa ng custom role na may sariling label.'
          ]
        },
        tips: {
          en: [
            "Only Super Admin and Admin can reach this page — everyone else's access is governed by what's set here."
          ],
          tl: [
            'Super Admin at Admin lang ang may access sa page na ito — ang access ng iba ay batay dito.'
          ]
        }
      },
      {
        key: 'auditLog',
        icon: <ClipboardList size={16} />,
        summary: {
          en: 'A read-only, tamper-proof trail of important actions taken across every module.',
          tl: 'Read-only, hindi maaaring baguhin na trail ng mahahalagang aksyon sa lahat ng module.'
        },
        steps: {
          en: [
            'Review the log to see who did what and when — every module writes to it automatically.',
            "Nothing here can be edited or deleted by anyone, including Admins — it's the system's permanent record."
          ],
          tl: [
            'Suriin ang log para makita kung sino ang gumawa ng ano at kailan — automatic na naisusulat dito ang bawat module.',
            'Walang makapag-eedit o magtatanggal dito, kahit ang Admin — ito ang permanenteng record ng system.'
          ]
        }
      }
    ]
  },
  {
    key: 'system',
    icon: <SettingsIcon size={16} />,
    modules: [
      {
        key: 'settings',
        icon: <SettingsIcon size={16} />,
        summary: {
          en: 'Your personal app preferences, plus a few council-wide settings that only Admins can change.',
          tl: 'Ang sarili mong app preferences, kasama ang ilang setting ng buong konseho na Admin lang ang pwedeng magbago.'
        },
        steps: {
          en: [
            'Appearance: switch language (English/Tagalog), theme, accent color, font size, and compact mode.',
            'Security: change your own password.',
            'Notifications and Privacy: control what alerts you get and your data preferences.',
            'Membership Year and 13th Month Pay/Cash Gift: council-wide values that only a Super Admin or Admin can change — they apply on every device.'
          ],
          tl: [
            'Appearance: palitan ang wika (English/Tagalog), theme, accent color, font size, at compact mode.',
            'Security: palitan ang sarili mong password.',
            'Notifications at Privacy: kontrolin ang mga alert na natatanggap mo at ang iyong data preferences.',
            'Membership Year at 13th Month Pay/Cash Gift: mga value ng buong konseho na Super Admin o Admin lang ang pwedeng magbago — apektado ang lahat ng device.'
          ]
        }
      },
      {
        key: 'devices',
        icon: <Usb size={16} />,
        summary: {
          en: 'Connect and test the hardware GSPI Admin talks to: a barcode scanner, the Hikvision biometric terminal, and the receipt printer.',
          tl: 'I-connect at i-test ang hardware na ginagamit ng GSPI Admin: barcode scanner, Hikvision biometric terminal, at receipt printer.'
        },
        steps: {
          en: [
            'Barcode Scanner: plug in a USB scanner (works immediately) or pair one over Bluetooth, then scan a barcode below to confirm it works.',
            "Biometric Terminal: enter the Hikvision device's IP address, port, and credentials, then Test Connection before connecting — this feeds live attendance into the Attendance module.",
            'Receipt Printer: pick a Windows-installed printer and send a test print; turn on auto-print if you want a receipt every sale automatically.'
          ],
          tl: [
            'Barcode Scanner: i-plug ang USB scanner (gagana agad) o i-pair sa Bluetooth, pagkatapos i-scan ang barcode sa ibaba para ma-confirm.',
            'Biometric Terminal: ilagay ang IP address, port, at credentials ng Hikvision device, pagkatapos i-Test Connection bago i-connect — ito ang nagpapadala ng live attendance sa Attendance module.',
            'Receipt Printer: pumili ng naka-install na printer sa Windows at magpadala ng test print; i-on ang auto-print kung gusto mong automatic na mag-print ng resibo sa bawat benta.'
          ]
        },
        tips: {
          en: ['Only Super Admin and Admin can open this page by default.'],
          tl: ['Super Admin at Admin lang ang may access dito by default.']
        }
      },
      {
        key: 'about',
        icon: <Info size={16} />,
        summary: {
          en: "The app's version number and the technology it's built on.",
          tl: 'Ang version number ng app at ang teknolohiyang ginamit dito.'
        },
        steps: {
          en: ['Check here for the installed version number, useful when reporting an issue.'],
          tl: [
            'Tingnan dito ang naka-install na version number, kapaki-pakinabang kapag nag-rereport ng problema.'
          ]
        }
      }
    ]
  }
]
