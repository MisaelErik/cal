
import type { CalculationPlan, ExecutedStep, CalculationStep } from '../types';
import { evaluate } from 'mathjs';

export function executePlan(plan: CalculationPlan): ExecutedStep[] {
    const calculatedVariables: { [key: string]: number | string } = { ...plan.initial_data };
    const executedSteps: ExecutedStep[] = [];

    plan.calculation_steps.forEach((step: CalculationStep) => {
        // Resolve inputs from previously calculated variables
        const resolvedInputs = { ...step.inputs };
        for (const key in resolvedInputs) {
            const value = resolvedInputs[key];
            if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
                const varName = value.slice(2, -2);
                if (varName in calculatedVariables) {
                    resolvedInputs[key] = calculatedVariables[varName] as number;
                } else {
                    throw new Error(`Variable '${varName}' del paso anterior no encontrada.`);
                }
            }
        }
        
        const { result, substituted_formula } = calculateStep(step, resolvedInputs);

        calculatedVariables[step.target_variable] = result;
        executedSteps.push({
            ...step,
            inputs: resolvedInputs,
            result,
            substituted_formula,
        });
    });

    return executedSteps;
}

function calculateStep(step: CalculationStep, inputs: { [key: string]: any }): { result: number, substituted_formula: string } {
    let result: number;
    let substituted_formula = '';
    
    const { formula_name, generated_formula } = step;
    
    // Alias common variables for easier use in formulas
    const { P, S, j, n, i, I, R, m, k, G, g, de, d, DB, N, i_conocida, n_conocida, n_deseada, n_dias, fecha_inicial, fecha_final } = inputs;

    switch (formula_name) {
        // Utilidades
        case 'formula_util_dias_entre_fechas': {
            if (typeof fecha_inicial !== 'string' || typeof fecha_final !== 'string') {
                throw new Error("Se requieren 'fecha_inicial' y 'fecha_final' como texto (YYYY-MM-DD) para 'formula_util_dias_entre_fechas'.");
            }
            // Add time to avoid timezone issues, interpreting dates as local midnight
            const date1 = new Date(fecha_inicial + 'T00:00:00');
            const date2 = new Date(fecha_final + 'T00:00:00');
            if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
                throw new Error(`Fechas inválidas proporcionadas: '${fecha_inicial}', '${fecha_final}'. Use el formato YYYY-MM-DD.`);
            }
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            result = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            substituted_formula = `DiasEntre(${fecha_final}, ${fecha_inicial}) = ${result}`;
            break;
        }
        case 'formula_util_fraccion_anio':
            if (typeof n_dias !== 'number') {
                throw new Error("El cálculo para 'formula_util_fraccion_anio' requiere una entrada numérica para 'n_dias'.");
            }
            result = n_dias / 360;
            substituted_formula = `${n_dias} / 360 = ${result}`;
            break;

        // Interés Simple
        case 'formula_is_I_from_Pjn':
            result = P * j * n;
            substituted_formula = `${P} * ${j} * ${n} = ${result}`;
            break;
        case 'formula_is_S_from_Pjn':
            result = P * (1 + j * n);
            substituted_formula = `${P} * (1 + ${j} * ${n}) = ${result}`;
            break;
        case 'formula_is_P_from_Sjn':
            result = S / (1 + j * n);
            substituted_formula = `${S} / (1 + ${j} * ${n}) = ${result}`;
            break;
        case 'formula_is_P_from_Ijn':
            result = I / (j * n);
            substituted_formula = `${I} / (${j} * ${n}) = ${result}`;
            break;
        case 'formula_is_n_from_IPj':
            result = I / (P * j);
            substituted_formula = `${I} / (${P} * ${j}) = ${result}`;
            break;
        case 'formula_is_j_from_IPn':
            result = I / (P * n);
            substituted_formula = `${I} / (${P} * ${n}) = ${result}`;
            break;
        case 'formula_is_n_from_SPI':
            result = (S / P - 1) / j;
            substituted_formula = `(${S} / ${P} - 1) / ${j} = ${result}`;
            break;
        case 'formula_is_j_from_SPn':
            result = (S / P - 1) / n;
            substituted_formula = `(${S} / ${P} - 1) / ${n} = ${result}`;
            break;

        // Interés Compuesto
        case 'formula_ic_S_from_Pin':
            result = P * Math.pow(1 + i, n);
            substituted_formula = `${P} * (1 + ${i})^${n} = ${result}`;
            break;
        case 'formula_ic_P_from_Sin':
            result = S * Math.pow(1 + i, -n);
            substituted_formula = `${S} * (1 + ${i})^-${n} = ${result}`;
            break;
        case 'formula_ic_I_from_Pin':
            result = P * (Math.pow(1 + i, n) - 1);
            substituted_formula = `${P} * ((1 + ${i})^${n} - 1) = ${result}`;
            break;
        case 'formula_ic_P_from_Iin':
            result = I / (Math.pow(1 + i, n) - 1);
            substituted_formula = `${I} / ((1 + ${i})^${n} - 1) = ${result}`;
            break;
        case 'formula_ic_n_from_SPi':
            result = Math.log(S / P) / Math.log(1 + i);
            substituted_formula = `log(${S} / ${P}) / log(1 + ${i}) = ${result}`;
            break;
        case 'formula_ic_i_from_SPn':
            result = Math.pow(S / P, 1 / n) - 1;
            substituted_formula = `(${S} / ${P})^(1/${n}) - 1 = ${result}`;
            break;
        case 'formula_ic_S_from_Pjm':
            result = P * Math.pow(1 + j / m, n);
            substituted_formula = `${P} * (1 + ${j} / ${m})^${n} = ${result}`;
            break;
        case 'formula_ic_P_from_Sjm':
            result = S * Math.pow(1 + j / m, -n);
            substituted_formula = `${S} * (1 + ${j} / ${m})^-${n} = ${result}`;
            break;
        case 'formula_ic_n_from_IPi':
            result = Math.log(I / P + 1) / Math.log(1 + i);
            substituted_formula = `log(${I} / ${P} + 1) / log(1 + ${i}) = ${result}`;
            break;
        case 'formula_ic_i_from_IPn':
            result = Math.pow(I / P + 1, 1 / n) - 1;
            substituted_formula = `(${I} / ${P} + 1)^(1/${n}) - 1 = ${result}`;
            break;
        case 'formula_ic_j_from_SPnm':
            result = m * (Math.pow(S / P, 1 / n) - 1);
            substituted_formula = `${m} * ((${S} / ${P})^(1/${n}) - 1) = ${result}`;
            break;

        // Tasas
        case 'formula_tasa_efectiva_from_nominal': {
            const { j, m } = inputs;
             if (typeof j !== 'number' || typeof m !== 'number') {
                throw new Error(`Entradas no válidas para 'formula_tasa_efectiva_from_nominal'. Se requieren 'j' y 'm' como números.`);
            }
            if (m === 0) {
                throw new Error("La frecuencia de capitalización (m) no puede ser cero para 'formula_tasa_efectiva_from_nominal'.");
            }
            const t = typeof inputs.t === 'number' ? inputs.t : 1;
            result = Math.pow(1 + j / m, m * t) - 1;
            substituted_formula = `(1 + ${j} / ${m})^(${m}*${t}) - 1 = ${result}`;
            break;
        }
        case 'formula_tasa_equivalente':
             result = Math.pow(1 + i_conocida, n_deseada / n_conocida) - 1;
             substituted_formula = `(1 + ${i_conocida})^(${n_deseada}/${n_conocida}) - 1 = ${result}`;
             break;

        // Descuento Racional
        case 'formula_drs_D_from_Sjn':
            result = (S * j * n) / (1 + j * n);
            substituted_formula = `(${S} * ${j} * ${n}) / (1 + ${j} * ${n}) = ${result}`;
            break;
        case 'formula_dr_D_from_Sin':
            result = S * (1 - Math.pow(1 + i, -n));
            substituted_formula = `${S} * (1 - (1 + ${i})^-${n}) = ${result}`;
            break;

        // Descuento Bancario Simple
        case 'formula_dbs_DB_from_Sdn':
            result = S * d * n;
            substituted_formula = `${S} * ${d} * ${n} = ${result}`;
            break;
        case 'formula_dbs_P_from_Sdn':
            result = S * (1 - d * n);
            substituted_formula = `${S} * (1 - ${d} * ${n}) = ${result}`;
            break;
        case 'formula_dbs_S_from_DBdn':
            result = DB / (d * n);
            substituted_formula = `${DB} / (${d} * ${n}) = ${result}`;
            break;
        case 'formula_dbs_d_from_DBSn':
            result = DB / (S * n);
            substituted_formula = `${DB} / (${S} * ${n}) = ${result}`;
            break;
        case 'formula_dbs_n_from_DBSd':
            result = DB / (S * d);
            substituted_formula = `${DB} / (${S} * ${d}) = ${result}`;
            break;
        
        // Descuento Bancario Compuesto
        case 'formula_db_DB_from_Sden':
             result = S * (1 - Math.pow(1 - de, n));
             substituted_formula = `${S} * (1 - (1 - ${de})^${n}) = ${result}`;
             break;
        case 'formula_db_de_from_Psn':
            result = 1 - Math.pow(P / S, 1 / n);
            substituted_formula = `1 - (${P}/${S})^(1/${n}) = ${result}`;
            break;
        case 'formula_db_P_from_Sden':
            result = S * Math.pow(1 - de, n);
            substituted_formula = `${S} * (1 - ${de})^${n} = ${result}`;
            break;
        case 'formula_db_S_from_DBden':
            result = DB / (1 - Math.pow(1 - de, n));
            substituted_formula = `${DB} / (1 - (1 - ${de})^${n}) = ${result}`;
            break;
        case 'formula_db_de_from_DBSn':
            result = 1 - Math.pow(1 - DB / S, 1 / n);
            substituted_formula = `1 - (1 - ${DB}/${S})^(1/${n}) = ${result}`;
            break;
        case 'formula_db_n_from_DBSde':
            result = Math.log(1 - DB / S) / Math.log(1 - de);
            substituted_formula = `log(1 - ${DB}/${S}) / log(1 - ${de}) = ${result}`;
            break;

        // Anualidades Vencidas
        case 'formula_av_S_from_Rin':
            result = R * ((Math.pow(1 + i, n) - 1) / i);
            substituted_formula = `${R} * ((1 + ${i})^${n} - 1) / ${i} = ${result}`;
            break;
        case 'formula_av_P_from_Rin':
            result = R * ((1 - Math.pow(1 + i, -n)) / i);
            substituted_formula = `${R} * (1 - (1 + ${i})^-${n}) / ${i} = ${result}`;
            break;
        case 'formula_av_R_from_Sin':
            result = S * (i / (Math.pow(1 + i, n) - 1));
            substituted_formula = `${S} * (${i} / ((1 + ${i})^${n} - 1)) = ${result}`;
            break;
        case 'formula_av_R_from_Pin':
            result = P * (i / (1 - Math.pow(1 + i, -n)));
            substituted_formula = `${P} * (${i} / (1 - (1 + ${i})^-${n})) = ${result}`;
            break;
        case 'formula_av_n_from_SRi':
            result = Math.log((S * i / R) + 1) / Math.log(1 + i);
            substituted_formula = `log((${S} * ${i} / ${R}) + 1) / log(1 + ${i}) = ${result}`;
            break;
        case 'formula_av_n_from_PRi':
            result = -Math.log(1 - (P * i / R)) / Math.log(1 + i);
            substituted_formula = `-log(1 - (${P} * ${i} / ${R})) / log(1 + ${i}) = ${result}`;
            break;
            
        // Anualidades Anticipadas
        case 'formula_aa_S_from_Rin':
            result = R * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            substituted_formula = `${R} * (((1 + ${i})^${n} - 1) / ${i}) * (1 + ${i}) = ${result}`;
            break;
        case 'formula_aa_P_from_Rin':
            result = R * ((1 - Math.pow(1 + i, -n)) / i) * (1 + i);
            substituted_formula = `${R} * ((1 - (1 + ${i})^-${n}) / ${i}) * (1 + ${i}) = ${result}`;
            break;
        case 'formula_aa_R_from_Sin':
            result = (S / (1 + i)) * (i / (Math.pow(1 + i, n) - 1));
            substituted_formula = `(${S} / (1 + ${i})) * (${i} / ((1 + ${i})^${n} - 1)) = ${result}`;
            break;
        case 'formula_aa_R_from_Pin':
            result = (P / (1 + i)) * (i / (1 - Math.pow(1 + i, -n)));
            substituted_formula = `(${P} / (1 + ${i})) * (${i} / (1 - (1 + ${i})^-${n})) = ${result}`;
            break;

        // Anualidades Diferidas
        case 'formula_adv_P_from_Rink': // Vencida
            result = R * ((1 - Math.pow(1 + i, -n)) / i) * Math.pow(1 + i, -k);
            substituted_formula = `${R} * ((1 - (1 + ${i})^-${n}) / ${i}) * (1 + ${i})^-${k} = ${result}`;
            break;
        case 'formula_ada_P_from_Rink': // Anticipada
            result = R * ((1 - Math.pow(1 + i, -n)) / i) * (1 + i) * Math.pow(1 + i, -k);
            substituted_formula = `${R} * ((1 - (1 + ${i})^-${n}) / ${i}) * (1 + ${i}) * (1 + ${i})^-${k} = ${result}`;
            break;
        case 'formula_adv_n_from_PRik':
            result = -Math.log(1 - (P * Math.pow(1 + i, k) * i / R)) / Math.log(1 + i);
            substituted_formula = `-log(1 - (${P} * (1+${i})^${k} * ${i} / ${R})) / log(1+${i}) = ${result}`;
            break;
        case 'formula_adv_k_from_PRin':
            result = Math.log(R * (1 - Math.pow(1 + i, -n)) / (P * i)) / Math.log(1 + i);
            substituted_formula = `log(${R} * (1 - (1+${i})^-${n}) / (${P}*${i})) / log(1+${i}) = ${result}`;
            break;

        // Gradientes
        case 'formula_ga_P_from_Gin':
            result = (G / i) * (((1 - Math.pow(1 + i, -n)) / i) - (n * Math.pow(1 + i, -n)));
            substituted_formula = `(${G} / ${i}) * (((1 - (1 + ${i})^-${n}) / ${i}) - (${n} * (1 + ${i})^-${n})) = ${result}`;
            break;
        case 'formula_ga_S_from_Gin':
            result = (G / i) * ((((Math.pow(1 + i, n) - 1) / i) - n));
            substituted_formula = `(${G} / ${i}) * ((((1 + ${i})^${n} - 1) / ${i}) - ${n}) = ${result}`;
            break;
        case 'formula_ga_R_from_Gin':
            result = G * (1 / i - n / (Math.pow(1 + i, n) - 1));
            substituted_formula = `${G} * (1/${i} - ${n}/((1+${i})^${n}-1)) = ${result}`;
            break;
        case 'formula_gg_P_from_Rgin':
            if (i === g) {
                result = n * R / (1 + i);
                substituted_formula = `${n} * ${R} / (1 + ${i}) = ${result} (Caso especial g=i)`;
            } else {
                result = R * ((1 - Math.pow((1 + g) / (1 + i), n)) / (i - g));
                substituted_formula = `${R} * ((1 - ((1 + ${g}) / (1 + ${i}))^${n}) / (${i} - ${g})) = ${result}`;
            }
            break;
        case 'formula_gg_S_from_Rgin':
            if (i === g) {
                result = n * R * Math.pow(1 + i, n - 1);
                substituted_formula = `${n} * ${R} * (1+${i})^(${n}-1) = ${result} (Caso especial g=i)`;
            } else {
                result = R * ((Math.pow(1 + i, n) - Math.pow(1 + g, n)) / (i - g));
                substituted_formula = `${R} * (((1 + ${i})^${n} - (1 + ${g})^${n}) / (${i} - ${g})) = ${result}`;
            }
            break;
            
        // Préstamos
        case 'formula_prestamo_saldo_N':
            result = P * ((Math.pow(1 + i, n) - Math.pow(1 + i, N)) / (Math.pow(1 + i, n) - 1));
            substituted_formula = `${P} * (((1 + ${i})^${n} - (1 + ${i})^${N}) / ((1 + ${i})^${n} - 1)) = ${result}`;
            break;
        case 'formula_prestamo_amortizacion_N':
            const R_amort = P * (i / (1 - Math.pow(1 + i, -n)));
            result = R_amort * Math.pow(1 + i, N - 1 - n);
            substituted_formula = `(${P}*${i}/(1-(1+${i})^-${n})) * (1+${i})^(${N}-1-${n}) = ${result}`;
            break;
        case 'formula_prestamo_interes_N':
            const R_interes = P * (i / (1 - Math.pow(1 + i, -n)));
            result = R_interes * (1 - Math.pow(1 + i, N - 1 - n));
            substituted_formula = `(${P}*${i}/(1-(1+${i})^-${n})) * (1-(1+${i})^(${N}-1-${n})) = ${result}`;
            break;

        // Experimental
        case 'formula_experimental':
            if (!generated_formula) {
                 throw new Error(`Fórmula experimental seleccionada pero no se encontró 'generated_formula'.`);
            }
            // Create a scope for evaluation with the resolved inputs
            const scope = { ...inputs };
            result = evaluate(generated_formula, scope);
            
            // Create a readable substitution string
            let temp_sub = generated_formula;
            for(const [key, value] of Object.entries(inputs)){
                 temp_sub = temp_sub.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
            }
            substituted_formula = `${temp_sub} = ${result}`;
            break;

        default:
            throw new Error(`Fórmula '${formula_name}' no implementada en el motor de cálculo.`);
    }

    if (isNaN(result) || !isFinite(result)) {
        throw new Error(`El cálculo para '${formula_name}' resultó en un valor no válido. Verifique las entradas.`);
    }

    return { result, substituted_formula };
}