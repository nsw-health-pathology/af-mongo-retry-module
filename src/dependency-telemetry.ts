/**
 * Model for dependency telemetry
 */
export interface IDependencyTelemetry {
  data: string;
  dependencyTypeName: string;
  duration: number;
  time: Date;
  resultCode: string | number;
  success: boolean;
  name: string;
  target: string;
}
