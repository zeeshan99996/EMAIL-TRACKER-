import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CONTACTS_FILE = path.join(process.cwd(), 'data', 'contacts.json');

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

function getContacts(): ContactSubmission[] {
  try {
    if (!fs.existsSync(CONTACTS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(CONTACTS_FILE, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

function saveContact(contact: ContactSubmission) {
  try {
    const dir = path.dirname(CONTACTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const contacts = getContacts();
    contacts.unshift(contact);
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save contact submission:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const newContact: ContactSubmission = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      subject: String(subject || 'General Inquiry').trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
    };

    saveContact(newContact);

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting ERHA Technologies! Our engineering and support team will get back to you within 2 hours.',
      submissionId: newContact.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error processing contact form' },
      { status: 500 }
    );
  }
}
