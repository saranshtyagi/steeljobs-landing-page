import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">
            {i18n.language === "hi" ? "हिंदी" : i18n.language === "mr" ? "मराठी" : "EN"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")}
          className={i18n.language === "en" ? "bg-primary/10" : ""}
        >
          {t("language.english")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("hi")}
          className={i18n.language === "hi" ? "bg-primary/10" : ""}
        >
          {t("language.hindi")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("mr")}
          className={i18n.language === "mr" ? "bg-primary/10" : ""}
        >
          {t("language.marathi")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
