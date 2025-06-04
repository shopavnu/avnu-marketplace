// @ts-ignore - Ignoring TypeScript errors for imports
import { useEffect, useState } from "react";
// @ts-ignore
import { useRouter } from "next/router";
// @ts-ignore
import Image from "next/image";
// @ts-ignore
import Link from "next/link";
// @ts-ignore
import { motion } from "framer-motion";
import { ChevronRightIcon, EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import useCartStore from "@/stores/useCartStore";
import analytics, { EventType } from "@/services/analytics";

// Rest of the file remains unchanged...
