export interface CustomerAttribute {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerAttributeCreateInput = {
  name: string;
  description?: string;
};

export type CustomerAttributeUpdateInput = Partial<CustomerAttributeCreateInput>;
