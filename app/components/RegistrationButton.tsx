import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";

export interface RegistrationButtonProps {
  /** Function that initiates the registration request. */
  onRegister: () => Promise<boolean>;
  /** Optional initial label for the button. */
  label?: string;
  /** Optional Tailwind classes for the button. */
  className?: string;
}

export const RegistrationButton: React.FC<RegistrationButtonProps> = ({
  onRegister,
  label,
  className = "",
}) => {
  const { t } = useTranslation();
  const defaultLabel = t("registrationButton.label", {
    defaultValue: "Register",
  });

  enum State {
    Idle,
    CodeShown,
    Waiting,
    Done,
    Error,
  }

  const [state, setState] = useState(State.Idle);
  const [registrationCode, setRegistrationCode] = useState<string>("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout when component unmounts or state changes
  useEffect(() => {
    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, []);

  const startRegistration = async () => {
    if (state !== State.Idle) return;

    setState(State.CodeShown);
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setRegistrationCode(code);
    } catch {
      setState(State.Error);
    }
  };

  const confirmRegistration = async () => {
    if (state !== State.CodeShown) return;

    setState(State.Waiting);

    // Start timeout
    timeoutRef.current = setTimeout(() => {
      setState(State.Error);
    }, 60000); // 60 seconds

    try {
      const success = await onRegister();
      clearTimeout(timeoutRef.current!);
      setState(success ? State.Done : State.Error);
    } catch {
      clearTimeout(timeoutRef.current!);
      setState(State.Error);
    }
  };

  const renderContent = () => {
    switch (state) {
      case State.Idle:
        return label ?? defaultLabel;
      case State.CodeShown:
        return (
          <>
            <span className="mr-2">
              {t("registrationButton.codePrefix")}: {registrationCode}
            </span>
            <span>{t("registrationButton.confirmPrompt")}</span>
          </>
        );
      case State.Waiting:
        return (
          <>
            <span className="mr-2">{t("registrationButton.waiting")}</span>
            <span>{t("registrationButton.processing")}</span>
          </>
        );
      case State.Done:
        return <span>✅ {t("registrationButton.registered")}</span>;
      case State.Error:
        return (
          <>
            <span className="mr-2">❌ {t("registrationButton.error")}</span>
            <span>{t("registrationButton.tryAgain")}</span>
          </>
        );
      default:
        return label ?? defaultLabel;
    }
  };

  const handleClick = () => {
    if (state === State.Idle) startRegistration();
    else if (state === State.CodeShown) confirmRegistration();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={state === State.Waiting || state === State.Done}
      className={className}
    >
      {renderContent()}
    </Button>
  );
};
