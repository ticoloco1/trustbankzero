-- Allow authenticated users to insert ledger transactions (needed for pin posts)
CREATE POLICY "Users insert own ledger"
ON public.ledger_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow paywall_unlocks insert by authenticated users
CREATE POLICY "Users insert own paywall unlocks"
ON public.paywall_unlocks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);