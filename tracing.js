const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

const { JaegerExporter } = require('@opentelemetry/exporter-jaeger'); 

// Exporter setup
module.exports = (serviceName) => {
   // Set up the Jaeger exporter
   const exporter = new JaegerExporter({
       endpoint: 'http://localhost:14268/api/traces', // Jaeger's endpoint (use the appropriate one for your environment)
       serviceName: serviceName,
   });

   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   })
   provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
   provider.register();

   // Register the instrumentations
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });

   // Return the tracer instance
   return trace.getTracer(serviceName);
};
