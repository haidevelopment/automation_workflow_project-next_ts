export type CreditsPack = {
  id: string;
  name: string;
  credits: number;
  price: number; // in USD
  description: string;
};

export const CREDITS_PACKS: CreditsPack[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 1000,
    price: 10,
    description: "Phù hợp cho cá nhân mới bắt đầu tự động hóa.",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 5000,
    price: 40,
    description: "Dành cho người dùng chuyên nghiệp với nhu cầu cao.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 20000,
    price: 150,
    description: "Giải pháp cho doanh nghiệp với quy mô lớn.",
  },
];

export const DEFAULT_CREDITS = 500; // Số credit tặng khi mới tạo tài khoản
