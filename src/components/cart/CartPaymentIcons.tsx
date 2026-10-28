export function CartPaymentIcons() {
  return (
<span aria-label="PhonePe, Google Pay and CRED UPI" className="flex shrink-0 items-center -space-x-2">
                    <span title="PhonePe UPI" className="z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A3831] bg-[#5F259F] text-[11px] font-black normal-case text-white">पे</span>
                    <span title="Google Pay UPI" className="z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A3831] bg-white">
                      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                        <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                        <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
                        <path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z" />
                        <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.2 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z" />
                      </svg>
                    </span>
                    <span title="CRED UPI" className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A3831] bg-black text-white">
                      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                        <path d="M7 2.5h18v16L16 27 7 21V2.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M11 7h11v4H11v6l5 3 5-3v-2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <path d="m13.5 15 2.5 1.5 3-1.8" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                        <text x="16" y="32" textAnchor="middle" fill="currentColor" fontSize="4.2" fontWeight="800" letterSpacing=".8">CRED</text>
                      </svg>
                      <span className="sr-only">CRED</span>
                    </span>
                  </span>
  );
}
