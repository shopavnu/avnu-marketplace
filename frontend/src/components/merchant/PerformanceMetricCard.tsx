import { FC, ReactNode } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

interface PerformanceMetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  iconBgColor: string;
}

const PerformanceMetricCard: FC<PerformanceMetricCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor,
}) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <div className="flex items-center">
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {isPositive ? (
                <ArrowUpIcon className="h-4 w-4 inline mr-1" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 inline mr-1" />
              )}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">vs. previous period</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricCard;
