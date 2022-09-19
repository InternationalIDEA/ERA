import React from "react";
import { strLang } from "../../functions/language";
import { browserRouterList } from "../../constants/routes";
import { BTNSolid } from "../../components/Button";
import logo from "../../images/logo-square.png";

export default function Workshop() {
  const [downloadLink, setDownloadLink] = React.useState(
    browserRouterList.downloadApp
  );

  React.useEffect(() => {
    window.location = browserRouterList.workshop;

    fetch("data/json/links.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        response.forEach(function (link) {
          if (link.id === "download-app") {
            setDownloadLink(link.url);
          }
        });
      });
  }, []);
  return (
    <div className="bg-primary-grayLight">
      <div className="w-9/12 m-auto py-8 min-h-screen flex items-center justify-center">
        <div className="bg-white shadow overflow-hidden pb-8">
          <div className="border-t border-gray-200 text-center pt-8 max-w-3xl">
            <img src={logo} className="w-48 mx-auto" alt="logo" />
            <p className="text-lg mt-6 px-12 font-normal">
              {strLang.desc_launch_workshop_1 + " "}
              <b>{strLang.btn_open + " " + strLang.app_long_name + " "}</b>
              {strLang.desc_launch_workshop_2}
            </p>
            <p className="text-lg px-12 font-normal">
              {strLang.desc_launch_workshop_3 + " "}
              <b>{strLang.btn_launch + " " + strLang.app_long_name + " "}</b>
              {strLang.desc_launch_workshop_4}
            </p>
            <a href={browserRouterList.workshop}>
              <BTNSolid className="mt-8">
                {strLang.btn_launch + " " + strLang.app_long_name}
              </BTNSolid>
            </a>
            <div className="my-8 border-b-2 border-primary-grayLight" />
            <p className="text-sm px-12 font-normal">
              {strLang.desc_launch_workshop_5 +
                " " +
                strLang.app_long_name +
                " " +
                strLang.desc_launch_workshop_6 +
                " "}
              <a
                className="text-primary-orange underline"
                target="_blank"
                rel="noopener noreferrer"
                href={downloadLink}
              >
                {strLang.btn_download_now}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
