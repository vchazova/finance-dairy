"use client";
import * as React from "react";
import {
  Button,
  H1,
  H2,
  Text,
  Input,
  TextArea,
  Select,
  Modal,
} from "@/components/ui";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <H2>{title}</H2>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        {children}
      </div>
    </section>
  );
}

function ColorSwatch({
  name,
  varName,
  fgVar = "--bg",
}: {
  name: string;
  varName: string;
  fgVar?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-xl border border-[hsl(var(--border))]"
        style={{ backgroundColor: `hsl(var(${varName}))` }}
      />
      <div className="text-sm">
        <div className="font-medium text-[hsl(var(--fg))]">{name}</div>
        <div className="text-[hsl(var(--fg-muted))]">{varName}</div>
      </div>
    </div>
  );
}

function ThemeToggleInline() {
  const [theme, setTheme] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") || undefined;
    setTheme(current);
  }, []);
  function toggle() {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      setTheme(undefined);
    } else {
      root.setAttribute("data-theme", "dark");
      setTheme("dark");
    }
  }
  return (
    <Button
      variant="default"
      onClick={toggle}
      className="border-[hsl(var(--border))]"
    >
      Тема: {theme === "dark" ? "Dark" : "Light"}
    </Button>
  );
}

export default function UIShowcase() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10 space-y-10 text-[hsl(var(--fg))]">
      <header className="flex items-center justify-between gap-4">
        <div>
          <H1>UI‑kit Showcase</H1>
          <Text>
            Компоненты и цветовые токены (light/dark на CSS‑переменных).
          </Text>
        </div>
        <ThemeToggleInline />
      </header>

      <Section title="Цветовые токены">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ColorSwatch name="Background" varName="--bg" />
          <ColorSwatch name="Card" varName="--card" />
          <ColorSwatch name="Border" varName="--border" />
          <ColorSwatch name="Foreground" varName="--fg" />
          <ColorSwatch name="Foreground Muted" varName="--fg-muted" />
          <ColorSwatch name="Primary" varName="--color-primary" />
          <ColorSwatch name="Primary FG" varName="--color-primary-fg" />
          <ColorSwatch name="Secondary" varName="--color-secondary" />
          <ColorSwatch name="Secondary FG" varName="--color-secondary-fg" />
          <ColorSwatch name="Info" varName="--color-info" />
          <ColorSwatch name="Success" varName="--color-success" />
          <ColorSwatch name="Warning" varName="--color-warning" />
          <ColorSwatch name="Danger" varName="--color-danger" />
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl px-3 py-2 text-center text-sm bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-fg))]">
            primary
          </div>
          <div className="rounded-xl px-3 py-2 text-center text-sm bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-fg))]">
            secondary
          </div>
          <div className="rounded-xl px-3 py-2 text-center text-sm bg-[hsl(var(--color-info))] text-[hsl(var(--bg))]">
            info
          </div>
          <div className="rounded-xl px-3 py-2 text-center text-sm bg-[hsl(var(--color-success))] text-[hsl(var(--bg))]">
            success
          </div>
          <div className="rounded-xl px-3 py-2 text-center text-sm bg-[hsl(var(--color-warning))] text-[hsl(var(--fg))]">
            warning
          </div>
          <div className="rounded-xl px-3 py-2 text-center text-sm bg-[hsl(var(--color-danger))] text-[hsl(var(--bg))]">
            danger
          </div>
        </div>
      </Section>

      {/* Типографика */}
      <Section title="Типографика">
        <div className="space-y-2">
          <H1>H1 — Витрина компонентов</H1>
          <H2>H2 — Подзаголовок раздела</H2>
          <Text>
            Это обычный текст. Он использует токен <code>--fg</code> и должен
            быть читаемым на любой теме. Для второстепенных подписей применяй{" "}
            <span className="text-[hsl(var(--fg-muted))]">muted</span>.
          </Text>
        </div>
      </Section>

      {/* Кнопки */}
      <Section title="Кнопки: варианты и размеры">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="default">Default</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="default" disabled>
            Disabled
          </Button>
          <Button variant="primary" className="w-40" block>
            Block
          </Button>
        </div>
      </Section>

      {/* Поля формы */}
      <Section title="Поля формы и состояния">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Имя" placeholder="Введите имя" />
          <Input label="Email" type="email" placeholder="user@example.com" />
          <TextArea label="Комментарий" placeholder="Пара слов…" />
          <Select
            label="Роль"
            options={[
              { value: "", label: "—" },
              { value: "admin", label: "Админ" },
              { value: "user", label: "Пользователь" },
            ]}
          />
          <Input
            label="С ошибкой"
            placeholder="Не так…"
            error="Поле обязательно"
          />
          <Input label="Отключено" placeholder="Недоступно" disabled />
        </div>
      </Section>

      {/* Модалка */}
      <Section title="Модалка">
        <Button variant="primary" onClick={() => setOpen(true)}>
          Открыть модалку
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Базовая модалка"
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpen(false)} variant="ghost">
                Отмена
              </Button>
              <Button onClick={() => setOpen(false)} variant="primary">
                Ок
              </Button>
            </div>
          }
        >
          <Text>
            Доступна закрытием по ESC, клику по фону и кнопками ниже. Этот фон и
            границы завязаны на токены темы.
          </Text>
        </Modal>
      </Section>
      {/* Примеры алертов/баджей без отдельных компонентов */}
      <Section title="Примеры семантических цветов (бейджи/алерты)">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--color-info))]/10">
            <div className="mb-2 font-medium text-[hsl(var(--color-info))]">
              Info
            </div>
            <Text>Сообщение с нейтральной информацией.</Text>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--color-success))]/10">
            <div className="mb-2 font-medium text-[hsl(var(--color-success))]">
              Success
            </div>
            <Text>Операция завершена успешно.</Text>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--color-warning))]/10">
            <div className="mb-2 font-medium text-[hsl(var(--color-warning))]">
              Warning
            </div>
            <Text>Проверьте ввод перед продолжением.</Text>
          </div>
          <div className="rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--color-danger))]/10">
            <div className="mb-2 font-medium text-[hsl(var(--color-danger))]">
              Danger
            </div>
            <Text>Что-то пошло не так.</Text>
          </div>
        </div>
      </Section>

      <footer className="pt-4 text-sm text-[hsl(var(--fg-muted))]">
        Измени значения в CSS‑переменных — вся витрина обновится. Это и есть
        проверка, что всё сидит на токенах.
      </footer>
    </div>
  );
}
