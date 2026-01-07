import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../field";
import { Input } from "../../input";
import React, { ReactNode, useState } from "react";
import { Textarea } from "../../textarea";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../../select";
import { Checkbox } from "../../checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { MultiSelect } from "./MultiSelect";
import { FileUpload } from "./FileUpload";
import { cn } from "@/lib/utils";

type FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = {
  name: TName;
  label: ReactNode;
  description?: ReactNode;
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"];
};

type FormBaseProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
> = FormControlProps<TFieldValues, TName, TTransformedValues> & {
  horizontal?: boolean;
  controlFirst?: boolean;
  children: (
    field: Parameters<
      ControllerProps<TFieldValues, TName, TTransformedValues>["render"]
    >[0]["field"] & {
      "aria-invalid": boolean;
      id: string;
    }
  ) => ReactNode;
};

export type FormControlFunc<
  ExtraProps extends Record<string, unknown> = Record<never, never>
> = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>(
  props: FormControlProps<TFieldValues, TName, TTransformedValues> & ExtraProps
) => ReactNode;

export function FormBase<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues
>({
  children,
  control,
  label,
  name,
  description,
  controlFirst,
  horizontal,
}: FormBaseProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const labelElement = (
          <>
            <FieldLabel className=" text-sm font-medium" htmlFor={field.name}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
          </>
        );
        const control = children({
          ...field,
          id: field.name,
          "aria-invalid": fieldState.invalid,
        });
        const errorElem = fieldState.invalid && (
          <FieldError errors={[fieldState.error]} />
        );

        return (
          <Field
            data-invalid={fieldState.invalid}
            orientation={horizontal ? "horizontal" : undefined}
          >
            {controlFirst ? (
              <>
                {control}
                <FieldContent>
                  {labelElement}
                  {errorElem}
                </FieldContent>
              </>
            ) : (
              <>
                <FieldContent>{labelElement}</FieldContent>
                {control}
                {errorElem}
              </>
            )}
          </Field>
        );
      }}
    />
  );
}

export const FormInput: FormControlFunc<{
  prefix?: ReactNode;
  suffix?: ReactNode;
  placeholder?: string;
  inputClassName?: string;
  type?: string;
}> = (props) => {
  const { prefix, suffix, placeholder, inputClassName, type, ...restProps } = props;

  return (
    <FormBase {...restProps}>
      {(field) => (
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 flex items-center pointer-events-none text-text-secondary">
              {prefix}
            </div>
          )}
          <Input
            type={type}
            className={cn(
              "w-full h-12 bg-surface rounded-xl border border-border px-4 py-2 text-foreground placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all outline-none shadow-sm",
              prefix && "pl-11",
              suffix && "pr-11",
              inputClassName
            )}
            placeholder={placeholder}
            {...field}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center">
              {suffix}
            </div>
          )}
        </div>
      )}
    </FormBase>
  );
};

export const FormTextarea: FormControlFunc<{ prefix?: ReactNode; suffix?: ReactNode; inputClassName?: string; placeholder?: string }> = (props) => {
  const { prefix, suffix, inputClassName, placeholder, ...restProps } = props;

  return (
    <FormBase {...restProps}>
      {(field) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-3 flex items-start pointer-events-none">
              {prefix}
            </div>
          )}
          <Textarea
            className={cn(
              "w-full min-h-[100px] bg-surface rounded-xl border border-border px-4 py-3 text-foreground placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all outline-none shadow-sm resize-y",
              prefix && "pl-11",
              suffix && "pr-11",
              inputClassName
            )}
            {...field}
            placeholder={placeholder}
          />
          {suffix && (
            <div className="absolute right-3 top-3 flex items-start">
              {suffix}
            </div>
          )}
        </div>
      )}
    </FormBase>
  );
};

export const FormPassword: FormControlFunc<{ prefix?: ReactNode; placeholder?: string; inputClassName?: string }> = (props) => {
  const { prefix, placeholder, inputClassName, ...restProps } = props;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <FormBase {...restProps}>
      {(field) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
              {prefix}
            </div>
          )}
          <Input
            className={cn(
              "w-full h-12 bg-surface rounded-xl border border-border px-4 py-2 text-foreground placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all outline-none shadow-sm",
              prefix && "pl-11",
              "pr-11", // Always add right padding for eye icon
              inputClassName
            )}
            type={isPasswordVisible ? "text" : "password"}
            placeholder={placeholder}
            {...field}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors focus:outline-none"
            onClick={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
      )}
    </FormBase>
  );
};

export const FormSelect: FormControlFunc<{
  children: ReactNode;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}> = ({ children, placeholder = "Select an option", prefix, suffix, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, onBlur, ...field }) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {prefix}
            </div>
          )}
          <Select {...field} onValueChange={onChange}>
            <SelectTrigger
              className={cn(
                "w-full bg-primary-color! border! border-base-color/30! focus:border-base-color/70! outline-none! shadow! ring-0! text-base! py-5!",
                prefix && "pl-10",
                suffix && "pr-10"
              )}
              aria-invalid={field["aria-invalid"]}
              id={field.id}
              onBlur={onBlur}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-100!">{children}</SelectContent>
          </Select>
          {suffix && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10">
              {suffix}
            </div>
          )}
        </div>
      )}
    </FormBase>
  );
};

// FormMultiSelect component following FormBase pattern
export const FormMultiSelect: FormControlFunc<{
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}> = ({ options, placeholder = "Select items...", prefix, suffix, ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, value, ...field }) => (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {prefix}
            </div>
          )}
          <MultiSelect
            {...field}
            className={cn(
              prefix && "pl-10",
              suffix && "pr-10"
            )}
            options={options}
            placeholder={placeholder}
            value={value || []}
            onChange={onChange}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              {suffix}
            </div>
          )}
        </div>
      )}
    </FormBase>
  );
};



export const FormDurationInput: FormControlFunc = (props) => {
  return (
    <FormBase {...props}>
      {({ onChange, value, id, "aria-invalid": ariaInvalid }) => {
        const strVal = (value as string) || "";
        const parts = strVal.split(":");
        const hrDisplay = parts[0] ?? "";
        const minDisplay = parts[1] ?? "";

        const handleHrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const h = Math.max(0, Math.min(23, Number(e.target.value) || 0));
          onChange(`${h}:${minDisplay || "00"}`);
        };

        const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const m = Math.max(0, Math.min(59, Number(e.target.value) || 0));
          onChange(`${hrDisplay || "0"}:${m.toString().padStart(2, "0")}`);
        };

        return (
          <div
            id={id}
            aria-invalid={ariaInvalid}
            className={cn(
              "flex items-center rounded-md border border-base-color/30 bg-primary-color shadow text-base",
              ariaInvalid && "border-destructive"
            )}
          >
            <input
              type="number"
              min={0}
              max={23}
              value={hrDisplay}
              onChange={handleHrChange}
              placeholder="0"
              className="w-12 text-center bg-transparent outline-none py-2 px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-base-color/60 font-semibold select-none">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={minDisplay}
              onChange={handleMinChange}
              placeholder="00"
              className="w-12 text-center bg-transparent outline-none py-2 px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="ml-auto pr-3 text-sm text-base-color/40 select-none">hr : min</span>
          </div>
        );
      }}
    </FormBase>
  );
};

export const FormCheckbox: FormControlFunc = (props) => {
  return (
    <FormBase {...props} horizontal controlFirst>
      {({ onChange, value, ...field }) => (
        <Checkbox
          className="border-secondary-color bg-base-color/5"
          {...field}
          checked={value}
          onCheckedChange={onChange}
        />
      )}
    </FormBase>
  );
};

// FormUpload component that integrates FileUpload
export const FormUpload: FormControlFunc<{
  maxFiles?: number;
  accept?: string;
}> = ({ maxFiles = 5, accept = "image/*", ...props }) => {
  return (
    <FormBase {...props}>
      {({ onChange, value, ...field }) => (
        <FileUpload
          {...field}
          maxFiles={maxFiles}
          accept={accept}
          value={value || []}
          onChange={onChange}
        />
      )}
    </FormBase>
  );
};