import { Request } from "express";
import useragent from "express-useragent";

export function buildAnalyticsData(req: Request) {
  const ua = req.headers["user-agent"];
  const userAgent = useragent.parse(ua);
  const analyticsData: any = {
    useragent: req.headers["user-agent"],
    ip: req.ip,
    isMobile: userAgent.isMobile,
    isDesktop: userAgent.isDesktop,
  };
  return analyticsData;
}
