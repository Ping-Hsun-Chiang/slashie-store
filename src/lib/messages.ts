import { Inquiry } from "@/lib/types";

const STORE_NAME = "鞋槓青年";

function itemLabel(inquiry: Inquiry) {
  return inquiry.variant_label
    ? `${inquiry.product_name}（${inquiry.variant_label}）`
    : inquiry.product_name;
}

export function buildCannedMessage(inquiry: Inquiry): string | null {
  const item = itemLabel(inquiry);

  switch (inquiry.status) {
    case "paid":
      return `您好，已收到您在${STORE_NAME}訂購「${item}」的款項，我們會盡快向賣家下單，謝謝您的訂購！`;
    case "ordered":
      return `您好，您訂購的「${item}」已經向賣家下單囉，接下來會等待海外出貨與集運回台，請耐心等候～`;
    case "in_transit":
      return `您好，您訂購的「${item}」已抵達集運倉，正在等待轉運回台灣，好了會再通知您！`;
    case "arrived_tw":
      return `您好，您訂購的「${item}」已抵達台灣，近期會安排出貨，謝謝您耐心等候！`;
    case "confirmed":
      return `您好，已確認您在${STORE_NAME}訂購的「${item}」，我們會盡快安排出貨。`;
    case "shipped":
      return inquiry.tracking_number
        ? `您好，您在${STORE_NAME}訂購的「${item}」已出貨，寄件編號：${inquiry.tracking_number}，請留意簽收，謝謝！`
        : `您好，您在${STORE_NAME}訂購的「${item}」已出貨，請留意簽收，謝謝！`;
    case "completed":
      return `您好，感謝您這次在${STORE_NAME}購買「${item}」，也歡迎再度光臨！`;
    default:
      return null;
  }
}
