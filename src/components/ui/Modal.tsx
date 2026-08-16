import type { ReactNode } from "react";
import { Dialog, type DialogProps } from "@/components/ui/Dialog";

export interface ModalProps extends Omit<DialogProps, "title"> {
  title: string;
  children: ReactNode;
}

export function Modal(props: ModalProps) {
  return <Dialog {...props} />;
}
