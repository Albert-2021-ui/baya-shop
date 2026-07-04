import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    momoNumbers: [
      { operator: 'MTN / Moov / Orange', number: '01 63 09 74 98' },
      { operator: 'MTN / Moov / Orange', number: '01 53 37 49 53' }
    ],
    bankDetails: {
      accountName: process.env.BANK_ACCOUNT_NAME || 'Albert BAYA',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'N° de compte bancaire à compléter dans .env.local',
      bankName: process.env.BANK_NAME || 'À compléter dans .env.local (ex: SGCI, Ecobank...)'
    }
  });
}
