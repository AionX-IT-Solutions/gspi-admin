export interface CouncilBoardMember {
  id: string
  fullName: string
  /** e.g. "Council President", "Board Chairperson", "Vice Chairperson", "Trustee" — free
   *  text, council-defined (board titles vary council to council, unlike a fixed list). */
  position: string
  contactNumber?: string
  email?: string
  /** For the Dashboard's Upcoming Birthdays widget. */
  birthDate?: string
  /** Id of this member's direct superior on the Board (e.g. a Trustee reporting to the
   *  Chairperson), for the Council Board's own Organizational Chart. Unset = top of chart. */
  reportsToId?: string
  avatarColor: string
  photoUrl?: string
  photoStoragePath?: string
  createdAt: string
  updatedAt: string
}
