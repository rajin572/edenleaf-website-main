import OrderSuccessClient from "@/components/order/OrderSuccessClient";

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <OrderSuccessClient orderNumber={orderNumber} />;
}
