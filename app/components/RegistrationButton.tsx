// react-view5/app/components/RegistrationButton.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";

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
  label = "Register",
  className = "",
}) => {
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
        return label;
      case State.CodeShown:
        return (
          <>
            <span className="mr-2">Code: {registrationCode}</span>
            <span>Click again to confirm</span>
          </>
        );
      case State.Waiting:
        return (
          <>
            <span className="mr-2">Waiting...</span>
            <span>Processing, please wait</span>
          </>
        );
      case State.Done:
        return <span>✅ Registered</span>;
      case State.Error:
        return (
          <>
            <span className="mr-2">❌ Error</span>
            <span>Try again</span>
          </>
        );
      default:
        return label;
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
