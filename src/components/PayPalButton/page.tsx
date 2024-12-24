import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  total?: number;
  onSuccess?: (details: any) => void;
}

const PayPalButton = ({ total, onSuccess }: PayPalButtonProps) => {
  return (
    <PayPalScriptProvider
      options={{
        clientId: "AWLXP5vCA1FjayLx8uiKQK_tqCIYX8JASMsGyc5Jw2NCuTxtWjJG89GJgfIsW2j6B-G7aIteNuF71Y-m",
        currency: "USD",
      }}
    >
      <PayPalButtons
        className="w-[400px]"
        createOrder={(data, actions) => {
          if (!total || isNaN(total)) {
            throw new Error("El total no es válido");
          }

          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: total.toFixed(0),
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            if (!actions.order) {
              throw new Error("No se encontró la orden");
            }

            const details = await actions.order.capture();
            if (onSuccess) {
              onSuccess(details);
            }
          } catch (error) {
            console.error("Error al aprobar el pago:", error);
            if (onSuccess) {
              onSuccess(error);
            }
          }
        }}
        onCancel={(data) => {
          console.log("Pago cancelado:", data);
          alert("El pago fue cancelado.");
        }}
        onError={(error) => {
          console.error("Error en la transacción de PayPal:", error);
          alert("Hubo un error al procesar el pago.");
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;