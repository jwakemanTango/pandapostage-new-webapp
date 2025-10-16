import { type User, type InsertUser, type Address } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAddresses(): Promise<Address[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private addresses: Address[];

  constructor() {
    this.users = new Map();
    this.addresses = [
      {
        id: 1,
        name: "John Smith",
        company: "Acme Corp",
        phone: "(555) 123-4567",
        addressLine1: "123 Main Street",
        addressLine2: "Suite 100",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "US",
        type: "sender"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        company: "Tech Solutions Inc",
        phone: "(555) 234-5678",
        addressLine1: "456 Oak Avenue",
        addressLine2: "",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "US",
        type: "sender"
      },
      {
        id: 3,
        name: "Michael Brown",
        company: "",
        phone: "(555) 345-6789",
        addressLine1: "789 Pine Road",
        addressLine2: "Apt 5B",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "US",
        type: "sender"
      },
      {
        id: 4,
        name: "Emily Davis",
        company: "Global Enterprises",
        phone: "(555) 456-7890",
        addressLine1: "321 Elm Street",
        addressLine2: "",
        city: "Houston",
        state: "TX",
        zipCode: "77001",
        country: "US",
        type: "recipient"
      },
      {
        id: 5,
        name: "Robert Wilson",
        company: "",
        phone: "(555) 567-8901",
        addressLine1: "654 Maple Drive",
        addressLine2: "Unit 12",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
        country: "US",
        type: "recipient"
      },
      {
        id: 6,
        name: "Jennifer Martinez",
        company: "Creative Studios",
        phone: "(555) 678-9012",
        addressLine1: "987 Cedar Lane",
        addressLine2: "",
        city: "Philadelphia",
        state: "PA",
        zipCode: "19101",
        country: "US",
        type: "recipient"
      },
      {
        id: 7,
        name: "David Anderson",
        company: "Anderson & Associates",
        phone: "(555) 789-0123",
        addressLine1: "147 Birch Boulevard",
        addressLine2: "Floor 3",
        city: "San Antonio",
        state: "TX",
        zipCode: "78201",
        country: "US",
        type: "sender"
      },
      {
        id: 8,
        name: "Lisa Thompson",
        company: "",
        phone: "(555) 890-1234",
        addressLine1: "258 Spruce Court",
        addressLine2: "",
        city: "San Diego",
        state: "CA",
        zipCode: "92101",
        country: "US",
        type: "recipient"
      },
      {
        id: 9,
        name: "James Garcia",
        company: "Garcia Logistics",
        phone: "(555) 901-2345",
        addressLine1: "369 Walnut Place",
        addressLine2: "Building A",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
        country: "US",
        type: "sender"
      },
      {
        id: 10,
        name: "Maria Rodriguez",
        company: "Rodriguez Retail",
        phone: "(555) 012-3456",
        addressLine1: "741 Ash Street",
        addressLine2: "",
        city: "San Jose",
        state: "CA",
        zipCode: "95101",
        country: "US",
        type: "recipient"
      }
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAddresses(): Promise<Address[]> {
    return this.addresses;
  }
}

export const storage = new MemStorage();
