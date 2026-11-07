'use client';

import {cn} from '@/lib/utils';
import {voiceCategories, voiceOptions} from '@/lib/constants';
import {VoiceSelectorProps} from '@/types';

const groups = [
    {label: 'Male Voices', keys: voiceCategories.male},
    {label: 'Female Voices', keys: voiceCategories.female},
] as const;

const VoiceSelector = ({disabled, className, value, onChange,}: VoiceSelectorProps) => {
    return (
        <div
            role="radiogroup"
            aria-label="Assistant voice"
            className={cn('space-y-6', className)}
        >
            {groups.map(({label, keys}) => (
                <div key={label} className="space-y-3">
                    <p className="text-base font-medium text-[var(--text-secondary)]">
                        {label}
                    </p>

                    <div className="voice-selector-options flex-col sm:flex-row">
                        {keys.map((key) => {
                            const voice = voiceOptions[key as keyof typeof voiceOptions];
                            const selected = value === key;

                            return (
                                <label
                                    key={key}
                                    className={cn(
                                        'voice-selector-option items-start justify-start has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#663820]/40',
                                        selected
                                            ? 'voice-selector-option-selected'
                                            : 'voice-selector-option-default',
                                        disabled && 'voice-selector-option-disabled',
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="voice"
                                        value={key}
                                        checked={selected}
                                        disabled={disabled}
                                        onChange={() => onChange(key)}
                                        className="sr-only"
                                    />

                                    {/* Custom radio dot */}
                                    <span
                                        aria-hidden
                                        className={cn(
                                            'mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border',
                                            selected
                                                ? 'border-[#663820]'
                                                : 'border-[var(--border-medium)]',
                                        )}
                                    >
                    {selected && (
                        <span className="size-2 rounded-full bg-[#663820]"/>
                    )}
                  </span>

                                    <span className="flex flex-col gap-1">
                    <span className="font-serif text-lg font-semibold leading-5 text-[var(--text-primary)]">
                      {voice.name}
                    </span>
                    <span className="text-sm leading-5 text-[var(--text-secondary)]">
                      {voice.description}
                    </span>
                  </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VoiceSelector;
