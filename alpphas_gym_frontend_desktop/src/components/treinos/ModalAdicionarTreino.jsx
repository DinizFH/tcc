import { useEffect, useState } from "react";

export default function ModalAdicionarTreino({ children, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Aciona a transição ao montar
    setTimeout(() => setShow(true), 10);
    return () => setShow(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50">
      <div
        className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative transform transition-all duration-300 ${
          show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
        >
          &times;
        </button>

        {children}
      </div>
    </div>
  );
}
