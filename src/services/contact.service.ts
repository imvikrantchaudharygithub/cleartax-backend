import { Contact } from '../models/Contact.model';
import { ContactCreateRequest, ContactResponse } from '../types/contact.types';

// Singleton pattern - only one contact document should exist
export const getContact = async (): Promise<ContactResponse> => {
  const contact = await Contact.findOne().lean();

  if (!contact) {
    throw new Error('Contact information not found');
  }

  return contact as unknown as ContactResponse;
};

export const upsertContact = async (data: ContactCreateRequest): Promise<ContactResponse> => {
  // Use findOneAndUpdate with upsert to ensure only one document exists
  const contact = await Contact.findOneAndUpdate(
    {},
    data,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  return contact as unknown as ContactResponse;
};

