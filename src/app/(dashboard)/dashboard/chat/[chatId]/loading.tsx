import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Loading: FC = () => {
  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <Skeleton circle={true} height={40} width={40} />
          </div>
          <div className="flex flex-col leading-tight">
            <Skeleton width={120} height={20} />
            <Skeleton width={200} height={15} className="mt-1" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-h-full overflow-y-scroll w-full">
        <div className="flex flex-col flex-auto h-full p-6">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-50 dark:bg-gray-900 h-full p-4">
            <div className="flex flex-col-reverse h-full overflow-x-auto mb-4">
              <div className="flex flex-col-reverse h-full">
                <div className="grid grid-cols-12 gap-y-2">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className={`${
                        index % 2 === 0
                          ? "col-start-1 col-end-13 sm:col-start-1 sm:col-end-8"
                          : "col-start-1 col-end-13 sm:col-start-6 sm:col-end-13"
                      } p-3 rounded-lg`}
                    >
                      <div
                        className={`flex items-center ${
                          index % 2 === 0
                            ? ""
                            : "justify-start flex-row-reverse"
                        }`}
                      >
                        <div className="relative h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700">
                          <Skeleton circle={true} height="100%" width="100%" />
                        </div>
                        <div
                          className={`relative ${
                            index % 2 === 0 ? "ml-3" : "mr-3"
                          } text-sm ${
                            index % 2 === 0
                              ? "bg-gray-200 dark:bg-gray-700"
                              : "bg-orange-100 dark:bg-orange-700"
                          } text-black dark:text-white py-2 px-4 border border-gray-100 dark:border-gray-700 rounded-xl`}
                        >
                          <Skeleton width={150} height={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 pt-4 mb-2 sm:mb-0">
        <Skeleton height={40} width="100%" />
      </div>
    </div>
  );
};

export default Loading;
