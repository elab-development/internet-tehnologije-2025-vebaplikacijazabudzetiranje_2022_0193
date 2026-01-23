-- AddConstraint: Ensure positive amounts in expenses
ALTER TABLE "expenses" 
ADD CONSTRAINT "expenses_amount_positive" 
CHECK (amount > 0);

-- AddConstraint: Ensure positive amounts in expense splits
ALTER TABLE "expense_splits" 
ADD CONSTRAINT "expense_splits_amount_positive" 
CHECK (amount > 0);

-- AddConstraint: Ensure positive amounts in settlements
ALTER TABLE "settlements" 
ADD CONSTRAINT "settlements_amount_positive" 
CHECK (amount > 0);

-- AddConstraint: Prevent self-settlement (user cannot settle with themselves)
ALTER TABLE "settlements" 
ADD CONSTRAINT "settlements_different_users" 
CHECK (from_user_id != to_user_id);