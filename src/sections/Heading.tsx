/** Shared headings are [plain, emphasised]; each look styles the <em> half its own way. */
export const Heading = ({ text: [a, b] }: { text: readonly [string, string] }) => <h2>{a} <em>{b}</em></h2>
